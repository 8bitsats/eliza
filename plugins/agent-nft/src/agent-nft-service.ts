import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { DNAService, DNAGenerationOptions, DNAResponse } from './dna-service';
import { ImageGenerationService, ImageGenerationOptions } from './image-generation-service';
import { MetaplexCoreService, NFTMetadata } from './metaplex-core-service';

export interface AgentMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  agentId: string;
  character: any;
}

export interface AgentDNAOptions extends DNAGenerationOptions {
  agentId: string;
  character: any;
}

export interface NFTGenerationResult {
  dna: DNAResponse;
  metadata: NFTMetadata;
  nftAddress: string;
  imageUrl?: string;
}

export class AgentNFTService {
  private dnaService: DNAService;
  private imageService: ImageGenerationService;
  private nftService: MetaplexCoreService;
  private outputDirectory: string;
  
  constructor() {
    // Initialize services using environment variables
    this.dnaService = new DNAService();
    this.imageService = new ImageGenerationService();
    this.nftService = new MetaplexCoreService();
    
    // Set up output directory for storing NFT metadata and images
    this.outputDirectory = process.env.NFT_OUTPUT_DIRECTORY || path.join(process.cwd(), 'nft-output');
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
    
    // Initialize Metaplex Core NFT service with a private key if available
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    if (privateKey) {
      this.nftService.initializeWithPrivateKey(privateKey);
    } else {
      console.warn('No wallet private key provided. NFT minting will not be available.');
    }
  }
  
  /**
   * Generate DNA for an agent
   */
  async generateAgentDNA(options: AgentDNAOptions): Promise<DNAResponse> {
    try {
      // Extract agent-specific options
      const { agentId, character, ...dnaOptions } = options;
      
      // Generate a starting sequence based on the agent ID if not provided
      if (!dnaOptions.startSequence) {
        // Create a deterministic starting sequence based on the agent ID
        const hash = crypto.createHash('sha256').update(agentId).digest('hex');
        dnaOptions.startSequence = this.createDNASequenceFromHash(hash, 16);
      }
      
      // Set reasonable defaults if not provided
      if (!dnaOptions.maxTokens) {
        dnaOptions.maxTokens = 64; // Generate a good amount of DNA for the agent
      }
      if (!dnaOptions.temperature) {
        dnaOptions.temperature = 0.7;
      }
      if (!dnaOptions.topK) {
        dnaOptions.topK = 40;
      }
      
      // Generate DNA using the DNA service
      return await this.dnaService.generateDNA(dnaOptions);
    } catch (error) {
      console.error('Error generating agent DNA:', error);
      throw error;
    }
  }
  
  /**
   * Generate an image for the agent based on character data and DNA
   */
  async generateAgentImage(character: any, dna: DNAResponse): Promise<{url?: string, base64Data?: string, imageHash: string}> {
    try {
      // Create a DNA-influenced prompt for the image generation
      const dnaProperties = this.dnaService.analyzeDNA(dna.sequence);
      
      // Generate the image
      const imageOptions: ImageGenerationOptions = {
        dnaSequence: dna.sequence,
        style: 'helix', // Default visualization style
        width: 1024,
        height: 1024
      };
      
      try {
        return await this.imageService.generateImage(imageOptions);
      } catch (error) {
        console.error('Error generating agent image:', error);
        
        // Use placeholder image if image generation fails
        console.log('Using placeholder image instead');
        const placeholderPath = path.join(process.cwd(), 'assets', 'placeholder-avatar.png');
        
        if (fs.existsSync(placeholderPath)) {
          const imageBuffer = fs.readFileSync(placeholderPath);
          const base64Data = imageBuffer.toString('base64');
          const imageHash = crypto.createHash('sha256').update(base64Data).digest('hex');
          
          return {
            base64Data,
            imageHash
          };
        } else {
          console.warn('Placeholder image not found at:', placeholderPath);
          // Generate a simple hash to continue the process
          const imageHash = crypto.createHash('sha256').update(dna.sequence).digest('hex');
          return {
            imageHash
          };
        }
      }
    } catch (error) {
      console.error('Error in generateAgentImage:', error);
      // Generate a simple hash to continue the process
      const imageHash = crypto.createHash('sha256').update(dna.sequence).digest('hex');
      return {
        imageHash
      };
    }
  }
  
  /**
   * Create and mint an NFT for an agent
   */
  async createAgentNFT(agentMetadata: AgentMetadata): Promise<NFTGenerationResult> {
    try {
      // 1. Generate DNA for the agent
      const dnaOptions: AgentDNAOptions = {
        agentId: agentMetadata.agentId,
        character: agentMetadata.character,
        maxTokens: 64, // Generate a good amount of DNA
        temperature: 0.7,
        topK: 40
      };
      const dna = await this.generateAgentDNA(dnaOptions);
      
      // 2. Generate an image based on the character and DNA
      const imageResult = await this.generateAgentImage(agentMetadata.character, dna);
      
      // 3. Create NFT metadata
      const nftMetadata: NFTMetadata = {
        name: agentMetadata.name,
        symbol: 'AGENT',
        description: agentMetadata.description,
        image: imageResult.url || '',
        attributes: [
          ...agentMetadata.attributes,
          { trait_type: 'DNA Sequence', value: dna.sequence.substring(0, 32) + '...' }, // Truncated for display
          { trait_type: 'DNA Hash', value: dna.hash }
        ],
        dna: dna.sequence
      };
      
      // 4. Store metadata to a JSON file
      const metadataFilePath = path.join(this.outputDirectory, `${agentMetadata.agentId}.json`);
      fs.writeFileSync(metadataFilePath, JSON.stringify(nftMetadata, null, 2));
      
      // 5. If we have a URL, use it directly; otherwise save the base64 data to a file
      let imagePath = '';
      if (imageResult.url) {
        imagePath = imageResult.url;
      } else if (imageResult.base64Data) {
        imagePath = path.join(this.outputDirectory, `${agentMetadata.agentId}.png`);
        await this.imageService.saveImageToDisk(imageResult.base64Data, `${agentMetadata.agentId}.png`, this.outputDirectory);
      }
      
      // 6. Mint the NFT if possible
      let nftAddress = '';
      try {
        nftAddress = await this.nftService.mintNFTSimple(nftMetadata);
      } catch (error) {
        console.warn('NFT minting failed, but continuing with metadata generation:', error);
        nftAddress = 'NFT_MINT_FAILED_' + crypto.randomBytes(8).toString('hex');
      }
      
      return {
        dna,
        metadata: nftMetadata,
        nftAddress,
        imageUrl: imageResult.url
      };
    } catch (error) {
      console.error('Error creating agent NFT:', error);
      throw error;
    }
  }
  
  /**
   * Get wallet balance in SOL
   */
  async getWalletBalance(): Promise<number> {
    try {
      const balance = await this.nftService.getWalletBalance();
      return balance;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Generate and mint NFT for an agent
   */
  async generateAndMintAgentNFT(options: {
    agentName: string;
    agentDescription: string;
    agentTraits: string[];
    characterData: any;
    visualizationStyle: string;
    dnaOptions: DNAGenerationOptions;
  }): Promise<NFTGenerationResult> {
    try {
      // Generate DNA sequence
      const dna = await this.dnaService.generateDNA(options.dnaOptions);

      // Generate NFT metadata
      const nftMetadata: NFTMetadata = {
        name: options.agentName,
        symbol: "AGENT",
        description: options.agentDescription,
        dna: dna.sequence,
        attributes: [
          ...options.agentTraits.map(trait => ({
            trait_type: 'Trait',
            value: trait
          })),
          {
            trait_type: 'DNA Length',
            value: dna.sequence.length.toString()
          }
        ]
      };

      // Generate NFT image using DNA visualization
      const imageOptions: ImageGenerationOptions = {
        dnaSequence: dna.sequence,
        style: options.visualizationStyle,
        width: 1024,
        height: 1024
      };
      const imageResult = await this.imageService.generateImage(imageOptions);
      nftMetadata.image = imageResult.url;

      // Mint NFT
      const nftAddress = await this.nftService.mintNFTSimple(nftMetadata);

      return {
        dna,
        metadata: nftMetadata,
        nftAddress,
        imageUrl: imageResult.url || ""
      };
    } catch (error) {
      console.error('Error generating and minting agent NFT:', error);
      throw error;
    }
  }
  
  /**
   * Create a DNA sequence from a hash
   */
  private createDNASequenceFromHash(hash: string, length: number): string {
    const nucleotides = ['A', 'C', 'G', 'T'];
    let sequence = '';
    
    // Use the hash to generate a deterministic DNA sequence
    for (let i = 0; i < length; i++) {
      const hashIndex = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % nucleotides.length;
      sequence += nucleotides[hashIndex];
    }
    
    return sequence;
  }
  
  /**
   * Create a DNA-influenced prompt for image generation
   */
  private createDNAInfluencedPrompt(dnaProperties: Record<string, number>): string {
    // Extract DNA properties
    const gcContent = dnaProperties.gcContent || 50;
    const aPercentage = dnaProperties.APercentage || 25;
    const tPercentage = dnaProperties.TPercentage || 25;
    const gPercentage = dnaProperties.GPercentage || 25;
    const cPercentage = dnaProperties.CPercentage || 25;
    
    // Determine visual characteristics based on DNA composition
    let colorScheme, moodTone, complexity;
    
    // GC content influences the overall color temperature (higher GC = cooler tones)
    if (gcContent > 60) {
      colorScheme = 'cool blue and green tones, with digital circuit-like patterns';
    } else if (gcContent < 40) {
      colorScheme = 'warm red and orange tones, with organic flowing patterns';
    } else {
      colorScheme = 'balanced color palette with both warm and cool elements';
    }
    
    // A/T ratio influences the mood/tone
    const atRatio = aPercentage / (tPercentage || 1);
    if (atRatio > 1.2) {
      moodTone = 'energetic and vibrant';
    } else if (atRatio < 0.8) {
      moodTone = 'calm and contemplative';
    } else {
      moodTone = 'balanced and harmonious';
    }
    
    // G/C ratio influences complexity
    const gcRatio = gPercentage / (cPercentage || 1);
    if (gcRatio > 1.2) {
      complexity = 'intricate and detailed';
    } else if (gcRatio < 0.8) {
      complexity = 'minimalist and streamlined';
    } else {
      complexity = 'moderately complex with balanced elements';
    }
    
    // Construct the prompt
    return `Create a ${moodTone}, ${complexity} avatar with ${colorScheme}. The image should be high resolution, with a futuristic tech aesthetic suggesting advanced AI and blockchain technology. Include subtle DNA helix motifs and digital elements representing the agent's unique genetic code.`;
  }
}

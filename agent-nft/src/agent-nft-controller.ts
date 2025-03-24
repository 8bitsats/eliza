import { DNAService, DNAGenerationOptions } from './dna-service';
import { NFTService, NFTMetadata, BlockchainPlatform, MintOptions } from './nft-service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

/**
 * Agent character data
 */
export interface AgentCharacterData {
  name: string;
  adjectives: string[];
  bio: string[];
  [key: string]: any; // Allow additional properties
}

/**
 * Agent NFT result
 */
export interface AgentNFTResult {
  agentName: string;
  nftAddress: string;
  dnaSequence: string;
  avatarUrl: string;
  platform: BlockchainPlatform;
  explorerUrl: string;
}

/**
 * Controller for generating agent NFTs
 */
export class AgentNFTController {
  private dnaService: DNAService;
  private nftService: NFTService;
  private avatarApiKey: string;
  private avatarApiEndpoint: string;

  /**
   * Create a new Agent NFT Controller
   */
  constructor() {
    this.dnaService = new DNAService(process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY);
    this.nftService = new NFTService(process.env.WALLET_PRIVATE_KEY);
    this.avatarApiKey = process.env.GROK_API_KEY || process.env.AVATAR_API_KEY || '';
    this.avatarApiEndpoint = process.env.AVATAR_API_ENDPOINT || 'https://api.grok.ai/generate-image';
  }

  /**
   * Create an NFT for an agent
   * @param characterData The agent's character data
   * @param agentDirectory Directory where the agent's files are stored
   * @param platform Blockchain platform to mint on
   * @returns Agent NFT information
   */
  async createAgentNFT(
    characterData: AgentCharacterData,
    agentDirectory: string,
    platform: BlockchainPlatform = BlockchainPlatform.SOLANA
  ): Promise<AgentNFTResult> {
    console.log(`Creating NFT for agent: ${characterData.name}`);

    // Step 1: Generate DNA
    const startSequence = characterData.name
      .replace(/[^A-Za-z]/g, '')
      .substring(0, 10)
      .toUpperCase();
    
    const dnaSequence = await this.generateAgentDNA(startSequence);
    console.log(`Generated DNA sequence: ${dnaSequence.substring(0, 20)}...`);

    // Step 2: Generate Avatar
    const avatarPath = await this.generateAgentAvatar(characterData, agentDirectory);
    console.log(`Generated avatar at: ${avatarPath}`);

    // Step 3: Prepare NFT metadata
    const metadata: NFTMetadata = {
      name: characterData.name,
      symbol: 'AGENT',
      description: characterData.bio?.join(' ') || `An Eliza OS agent named ${characterData.name}`,
      attributes: [
        { trait_type: 'Type', value: 'Agent' },
        ...characterData.adjectives.map(adj => ({ trait_type: 'Trait', value: adj }))
      ],
      royalty: 0.05, // 5%
      externalUrl: '',
      characterData: characterData,
      agentDNA: dnaSequence,
      platform
    };

    // Step 4: Mint the NFT
    const mintOptions: MintOptions = {
      platform,
      retry: true,
      maxRetries: 3,
      useDnaService: false // Already generated DNA
    };

    const mintResult = await this.nftService.mintNFT(metadata, avatarPath, mintOptions);

    // Step 5: Update character.json with NFT info
    characterData.dnaSequence = dnaSequence;
    characterData.nftAddress = mintResult.mintAddress;
    characterData.nftExplorerUrl = mintResult.explorerUrl;
    characterData.nftPlatform = platform;

    const characterFilePath = path.join(agentDirectory, 'character.json');
    fs.writeFileSync(characterFilePath, JSON.stringify(characterData, null, 2));

    return {
      agentName: characterData.name,
      nftAddress: mintResult.mintAddress || 'unknown',
      dnaSequence,
      avatarUrl: mintResult.metadataUri || '',
      platform,
      explorerUrl: mintResult.explorerUrl || ''
    };
  }

  /**
   * Generate DNA for an agent
   * @param startSequence Starting sequence for DNA generation
   * @returns Generated DNA sequence
   */
  private async generateAgentDNA(startSequence: string): Promise<string> {
    try {
      const dnaOptions: DNAGenerationOptions = {
        temperature: 0.7,
        maxTokens: 200,
        topK: 40,
        startSequence: startSequence || 'ACTGACTGACTGACTG',
      };

      const dnaResult = await this.dnaService.generateDNA(dnaOptions);

      return dnaResult.sequence;
    } catch (error) {
      console.error('Failed to generate DNA:', error);
      // Fallback to a simple hash-based DNA sequence
      const hash = require('crypto').createHash('sha256').update(startSequence || 'AGENT').digest('hex');
      const bases = ['A', 'C', 'T', 'G'];
      let mockDNA = startSequence || 'ACTGACTGACTGACTG';
      
      for (let i = 0; i < 32; i++) {
        const index = parseInt(hash.charAt(i % hash.length), 16) % 4;
        mockDNA += bases[index];
      }
      
      return mockDNA;
    }
  }

  /**
   * Generate an avatar for an agent
   * @param characterData Agent character data
   * @param outputDir Directory to save the avatar
   * @returns Path to the generated avatar
   */
  private async generateAgentAvatar(characterData: AgentCharacterData, outputDir: string): Promise<string> {
    const outputPath = path.join(outputDir, 'avatar.png');
    
    // Check if we already have an avatar
    if (fs.existsSync(outputPath)) {
      console.log('Using existing avatar image');
      return outputPath;
    }

    try {
      if (!this.avatarApiKey) {
        throw new Error('No avatar API key found');
      }

      // Create prompt for avatar generation
      const prompt = `Create an avatar for an AI agent named "${characterData.name}" with traits: ${characterData.adjectives.join(', ')}. ${characterData.bio?.join(' ')}`;
      
      // Call avatar generation API (e.g., Grok)
      const response = await axios.post(
        this.avatarApiEndpoint,
        { prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.avatarApiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        }
      );

      // Save the image to disk
      fs.writeFileSync(outputPath, response.data);
      return outputPath;
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      
      // Use a placeholder avatar
      const placeholderPath = path.join(__dirname, '../assets/placeholder-avatar.png');
      if (fs.existsSync(placeholderPath)) {
        fs.copyFileSync(placeholderPath, outputPath);
        return outputPath;
      }
      
      // Create a simple colored circle as fallback
      this.createPlaceholderAvatar(outputPath, characterData.name);
      return outputPath;
    }
  }

  /**
   * Create a simple placeholder avatar
   * @param outputPath Path to save the placeholder avatar
   * @param agentName Agent name for generating a consistent color
   */
  private createPlaceholderAvatar(outputPath: string, agentName: string): void {
    // Simple placeholder implementation - in a real app, you'd use a library like sharp or canvas
    // to create a proper image. This is just a stub.
    const placeholderSvg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#${this.getColorFromString(agentName)}"/>
      <text x="50%" y="50%" font-size="48" text-anchor="middle" fill="white">${agentName[0]}</text>
    </svg>`;
    
    fs.writeFileSync(outputPath, placeholderSvg);
  }

  /**
   * Get a color from a string (for consistent agent colors)
   * @param str String to generate color from
   * @returns Hex color code without the #
   */
  private getColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  }
}

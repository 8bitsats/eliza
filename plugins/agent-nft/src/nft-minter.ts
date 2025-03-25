import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { DNAVisualizer } from './dna-visualizer';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface AgentDNAMetadata extends NFTMetadata {
  dnaSequence: string;
  generation: number;
  evolutionHistory: string[];
}

export class NFTMinter {
  private readonly connection: Connection;
  private readonly wallet: Keypair;
  private readonly metaplex: Metaplex;
  private readonly visualizer: DNAVisualizer;

  constructor(
    connection: Connection,
    wallet: Keypair,
    visualizer: DNAVisualizer
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.visualizer = visualizer;
    this.metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(bundlrStorage());
  }

  async mintDNANFT(metadata: AgentDNAMetadata): Promise<string> {
    try {
      // Validate metadata
      if (!metadata || !metadata.name || !metadata.description) {
        throw new Error('Invalid metadata');
      }

      // Generate visual assets
      const visualAssets = await this.generateVisualAssets(metadata);

      // Create metadata
      const nftMetadata = {
        ...metadata,
        image: `data:image/png;base64,${visualAssets.primary.toString('base64')}`,
        animation_url: `data:image/png;base64,${visualAssets.animation.toString('base64')}`,
        attributes: [
          { trait_type: 'DNA', value: metadata.dnaSequence },
          { trait_type: 'Generation', value: metadata.generation.toString() },
          { trait_type: 'Type', value: 'Agent' },
        ],
      };

      // Upload metadata
      const uri = await this.uploadMetadata(nftMetadata);

      // Create NFT
      const nft = await this.metaplex.nfts().create({
        uri,
        name: metadata.name,
        sellerFeeBasisPoints: 500, // 5%
        symbol: 'AGT',
        isMutable: true,
      });

      return nft.id;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateVisualAssets(metadata: AgentDNAMetadata): Promise<{
    primary: Buffer;
    animation: Buffer;
  }> {
    try {
      // Generate primary image (matrix style)
      const primaryImage = await this.visualizer.createVisualization({
        dnaSequence: metadata.dnaSequence,
        style: 'matrix',
        width: 1024,
        height: 1024,
        colorScheme: {
          A: '#00ff00',
          T: '#0000ff',
          G: '#ffff00',
          C: '#ff0000',
          background: '#000000'
        }
      });

      // Generate animated helix
      const animation = await this.visualizer.createVisualization({
        dnaSequence: metadata.dnaSequence,
        style: 'helix',
        width: 1024,
        height: 1024,
        colorScheme: {
          A: '#00ff00',
          T: '#0000ff',
          G: '#ffff00',
          C: '#ff0000',
          background: '#000000'
        },
        animation: {
          enabled: true,
          duration: 5000,
          type: 'rotate'
        }
      });

      return {
        primary: primaryImage,
        animation
      };
    } catch (error: unknown) {
      console.error('Error generating visual assets:', error);
      throw new Error(`Failed to generate visual assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      // Convert metadata to JSON string
      const metadataJson = JSON.stringify(metadata);

      // Upload to Arweave using Metaplex's bundlr storage
      const uri = await this.metaplex.storage().upload(metadataJson);

      return uri;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      throw new Error(`Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Example usage
async function mintAgentNFT(agentData: any): Promise<string> {
  try {
    // Validate agent data
    if (!agentData || !agentData.name || !agentData.description) {
      throw new Error('Invalid agent data');
    }

    // Initialize the NFT minter
    const connection = new Connection('https://spl_governance:fracTivLJRfbJYJYVigipPS1E3whJcEJjeBR2YUyA@explorer-api.mainnet-beta.solana.com');
    const wallet = Keypair.fromSecretKey(Buffer.from(process.env.WALLET_SECRET_KEY!, 'base64'));
    const visualizer = new DNAVisualizer();
    const nftMinter = new NFTMinter(connection, wallet, visualizer);

    // Generate DNA sequence
    const dnaSequence = await visualizer.generateDNASequence(agentData);

    // Create metadata
    const metadata: AgentDNAMetadata = {
      name: agentData.name,
      description: agentData.description,
      image: '', // Will be set by the minter
      attributes: [],
      dnaSequence,
      generation: 1,
      evolutionHistory: [dnaSequence]
    };

    // Mint NFT
    const nft = await nftMinter.mintDNANFT(metadata);

    return nft;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}

// Example usage
async function main(): Promise<void> {
  try {
    const agentData = {
      name: 'Test Agent',
      description: 'A test agent NFT',
    };

    const nft = await mintAgentNFT(agentData);
    console.log('NFT minted successfully:', nft);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the example
main();

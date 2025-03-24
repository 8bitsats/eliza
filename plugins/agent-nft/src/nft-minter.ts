import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  Metaplex,
  bundlrStorage,
  toMetaplexFile,
  walletAdapterIdentity,
} from '@metaplex-foundation/js';
import { AgentDNAMetadata, NFTMetadata } from './types';
import { DNAVisualizer } from './dna-visualizer';

export class NFTMinter {
  private connection: Connection;
  private wallet: Keypair;
  private metaplex: Metaplex;
  private visualizer: DNAVisualizer;

  constructor(
    connection: Connection,
    wallet: Keypair,
    visualizer: DNAVisualizer
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet))
      .use(bundlrStorage());
    this.visualizer = visualizer;
  }

  /**
   * Mint a new NFT from DNA metadata
   */
  async mintDNANFT(
    dnaMetadata: AgentDNAMetadata
  ): Promise<{
    mint: PublicKey;
    metadata: NFTMetadata;
  }> {
    try {
      // Generate visual assets
      const visualAssets = await this.generateVisualAssets(dnaMetadata);

      // Upload assets to Arweave
      const imageUri = await this.uploadToArweave(visualAssets.primary);
      const animationUri = await this.uploadToArweave(visualAssets.animation);

      // Create NFT metadata
      const metadata: NFTMetadata = {
        name: dnaMetadata.name,
        symbol: dnaMetadata.symbol,
        description: dnaMetadata.description,
        seller_fee_basis_points: 500, // 5%
        image: imageUri,
        animation_url: animationUri,
        external_url: 'https://eliza.xyz/dna/' + dnaMetadata.dnaSequence,
        attributes: [
          {
            trait_type: 'Intelligence',
            value: dnaMetadata.attributes.intelligence
          },
          {
            trait_type: 'Adaptability',
            value: dnaMetadata.attributes.adaptability
          },
          {
            trait_type: 'Creativity',
            value: dnaMetadata.attributes.creativity
          },
          {
            trait_type: 'Resilience',
            value: dnaMetadata.attributes.resilience
          },
          {
            trait_type: 'Generation',
            value: dnaMetadata.generation
          },
          ...dnaMetadata.attributes.specialization.map(spec => ({
            trait_type: 'Specialization',
            value: spec
          })),
          ...dnaMetadata.attributes.traits.map(trait => ({
            trait_type: 'Trait',
            value: trait
          }))
        ],
        properties: {
          files: [
            {
              uri: imageUri,
              type: 'image/png'
            },
            {
              uri: animationUri,
              type: 'video/mp4'
            }
          ],
          category: 'image',
          creators: [
            {
              address: this.wallet.publicKey.toString(),
              share: 100
            }
          ]
        },
        collection: {
          name: 'Agent DNA',
          family: 'Eliza'
        },
        uri: ''  // Will be set after metadata upload
      };

      // Upload metadata
      const metadataUri = await this.uploadMetadata(metadata);
      metadata.uri = metadataUri;

      // Mint NFT
      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: metadata.name,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
        symbol: metadata.symbol,
        creators: metadata.properties.creators.map(creator => ({
          address: new PublicKey(creator.address),
          share: creator.share,
          verified: true
        })),
        collection: null,
        uses: null
      });

      return {
        mint: nft.address,
        metadata
      };
    } catch (error) {
      console.error('Error minting DNA NFT:', error);
      throw new Error('NFT minting failed');
    }
  }

  /**
   * Generate visual assets for the NFT
   */
  private async generateVisualAssets(
    dnaMetadata: AgentDNAMetadata
  ): Promise<{
    primary: Buffer;
    animation: Buffer;
  }> {
    // Generate primary image (matrix style)
    const primaryImage = await this.visualizer.createVisualization({
      dnaSequence: dnaMetadata.dnaSequence,
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
      dnaSequence: dnaMetadata.dnaSequence,
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
  }

  /**
   * Upload file to Arweave
   */
  private async uploadToArweave(buffer: Buffer): Promise<string> {
    const file = toMetaplexFile(buffer, 'image.png');
    const imageUri = await this.metaplex.storage().upload(file);
    return imageUri;
  }

  /**
   * Upload metadata to Arweave
   */
  private async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    const { uri } = await this.metaplex.nfts().uploadMetadata(metadata);
    return uri;
  }
}

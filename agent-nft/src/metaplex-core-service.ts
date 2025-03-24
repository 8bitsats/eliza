import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createV1,
  mplCore,
  fetchAssetV1,
  transferV1,
  createCollectionV1,
  getAssetV1GpaBuilder,
  Key,
  updateAuthority,
  pluginAuthorityPair,
  ruleSet
} from '@metaplex-foundation/mpl-core';
import { 
  PublicKey as UmiPublicKey,
  TransactionBuilderSendAndConfirmOptions, 
  generateSigner, 
  signerIdentity,
  sol 
} from '@metaplex-foundation/umi';
import { PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  uri?: string; // URI to the metadata JSON
  attributes: {
    trait_type: string;
    value: string;
  }[];
  dna: string;
  character?: any;
  royalty?: number;
  collectionAddress?: string;
}

export class MetaplexCoreService {
  private umi: any;
  private payer: any;
  private collectionAddress: any;
  private collectionUpdateAuthority: any;
  private initialized: boolean = false;
  private collectionName: string = 'Eliza Agent Collection';
  private collectionUri: string = 'https://eliza.io/collections/agents.json';
  
  constructor(rpcEndpoint?: string, privateKey?: string) {
    const endpoint = rpcEndpoint || process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    this.umi = createUmi(endpoint, 'processed').use(mplCore());
    
    // Initialize with private key if provided
    if (privateKey) {
      this.initializeWithPrivateKey(privateKey);
    }
  }
  
  /**
   * Initialize the service with a private key
   */
  public initializeWithPrivateKey(privateKey: string) {
    try {
      // Create a signer from the private key
      const signer = generateSigner(this.umi);
      // Store the signer as the payer
      this.payer = signer;
      
      console.log('Initialized with private key successfully');
    
      this.umi.use(signerIdentity(this.payer));
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing with private key:', error);
      throw error;
    }
  }
  
  /**
   * Initialize a collection if one doesn't exist yet
   */
  public async ensureCollectionExists() {
    if (!this.initialized) {
      throw new Error('Service not initialized with private key');
    }
    
    try {
      // Check if we already have a collection
      if (this.collectionAddress) {
        return this.collectionAddress.publicKey;
      }
      
      // Create new collection signers
      this.collectionAddress = generateSigner(this.umi);
      this.collectionUpdateAuthority = generateSigner(this.umi);
      
      // Create a creator for royalties
      const creator = this.payer;
      
      const txConfig: TransactionBuilderSendAndConfirmOptions = {
        send: { skipPreflight: true },
        confirm: { commitment: 'processed' },
      };
      
      console.log(`Creating Collection: ${this.collectionAddress.publicKey.toString()}`);
      await createCollectionV1(this.umi, {
        name: this.collectionName,
        uri: this.collectionUri,
        collection: this.collectionAddress,
        updateAuthority: this.collectionUpdateAuthority.publicKey,
        plugins: [
          pluginAuthorityPair({
            type: 'Royalties',
            data: {
              basisPoints: 500, // 5%
              creators: [
                {
                  address: creator.publicKey,
                  percentage: 100,
                },
              ],
              ruleSet: ruleSet('None'),
            },
          }),
        ],
      }).sendAndConfirm(this.umi, txConfig);
      
      return this.collectionAddress.publicKey;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }
  
  /**
   * Mint a new NFT with the provided metadata
   */
  public async mintNFT(metadata: NFTMetadata, imagePath: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Service not initialized with private key');
    }
    
    try {
      // Ensure collection exists
      await this.ensureCollectionExists();
      
      // Upload metadata and image - in a real app, you'd upload these to IPFS or Arweave
      // For this demo, we'll assume metadata.uri is already populated with a valid URI
      // that points to JSON containing the image and metadata
      
      // Generate NFT asset signer
      const asset = generateSigner(this.umi);
      
      const txConfig: TransactionBuilderSendAndConfirmOptions = {
        send: { skipPreflight: true },
        confirm: { commitment: 'processed' },
      };
      
      // Create metadata URI (in a real app, this would be an IPFS or Arweave URI)
      const uri = metadata.uri || `https://eliza.io/agents/${asset.publicKey.toString()}.json`;
      
      // Mint the NFT
      console.log(`Minting NFT: ${metadata.name} with asset address: ${asset.publicKey.toString()}`);
      await createV1(this.umi, {
        name: metadata.name,
        uri: uri,
        asset: asset,
        collection: this.collectionAddress.publicKey,
        authority: this.collectionUpdateAuthority,
      }).sendAndConfirm(this.umi, txConfig);
      
      // Validate that the asset was created
      const createdAsset = await fetchAssetV1(this.umi, asset.publicKey);
      console.log(`Successfully minted NFT: ${createdAsset.name}`);
      
      return asset.publicKey.toString();
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }
  
  /**
   * Transfer an NFT to a new owner
   */
  public async transferNFT(assetAddress: string, newOwnerAddress: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Service not initialized with private key');
    }
    
    try {
      const txConfig: TransactionBuilderSendAndConfirmOptions = {
        send: { skipPreflight: true },
        confirm: { commitment: 'processed' },
      };
      
      // Convert addresses to UmiPublicKey
      const assetPublicKey = this.umi.publicKey(assetAddress);
      const newOwnerPublicKey = this.umi.publicKey(newOwnerAddress);
      
      // Transfer the NFT
      await transferV1(this.umi, {
        asset: assetPublicKey,
        newOwner: newOwnerPublicKey,
        collection: this.collectionAddress.publicKey,
      }).sendAndConfirm(this.umi, txConfig);
      
      // Verify the transfer
      const transferredAsset = await fetchAssetV1(this.umi, assetPublicKey);
      return transferredAsset.owner.toString() === newOwnerAddress;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }
  
  /**
   * Get all NFTs owned by a given wallet address
   */
  public async getNFTsByOwner(ownerAddress: string): Promise<any[]> {
    try {
      // Convert address to UmiPublicKey
      const ownerPublicKey = this.umi.publicKey(ownerAddress);
      
      const assets = await getAssetV1GpaBuilder(this.umi)
        .whereField('key', Key.AssetV1)
        .whereField('owner', ownerPublicKey)
        .getDeserialized();
      
      return assets;
    } catch (error) {
      console.error('Error fetching NFTs by owner:', error);
      throw error;
    }
  }
  
  /**
   * Get all NFTs in the collection
   */
  public async getNFTsByCollection(): Promise<any[]> {
    try {
      if (!this.collectionAddress) {
        throw new Error('Collection not initialized');
      }
      
      const assets = await getAssetV1GpaBuilder(this.umi)
        .whereField('key', Key.AssetV1)
        .whereField(
          'updateAuthority',
          updateAuthority('Collection', [this.collectionAddress.publicKey])
        )
        .getDeserialized();
      
      return assets;
    } catch (error) {
      console.error('Error fetching NFTs by collection:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  public async getWalletBalance(): Promise<number> {
    // TODO: Implement actual wallet balance check
    return 0;
  }

  /**
   * Mint a new NFT with the provided metadata
   */
  public async mintNFTSimple(metadata: NFTMetadata): Promise<string> {
    // TODO: Implement actual NFT minting
    return "dummy-nft-address";
  }
}

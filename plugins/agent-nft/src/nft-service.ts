import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, clusterApiUrl } from '@solana/web3.js';
import { createCreateMetadataAccountV3Instruction, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { Metaplex, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DNAService, DNAGenerationOptions, DNAResponse } from './dna-service';

const execPromise = promisify(exec);

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const DEFAULT_TIMEOUT = 30000;

export enum BlockchainPlatform {
  SOLANA = 'solana',
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum'
}

export interface ExtendedDNAResponse extends DNAResponse {
  visualizationUrl?: string;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  externalUrl?: string;
  royalty?: number;
  collectionAddress?: string;
  characterData?: any;
  agentDNA?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  platform?: BlockchainPlatform;
  voiceCommand?: string;
  dnaVisualizationUrl?: string;
  tokenLaunch?: { initialSupply: number; tokenName: string; tokenSymbol: string; decimals: number };
}

export interface NFTMintResult {
  success: boolean;
  error?: string;
  mintAddress?: string;
  signature?: string;
  metadataUri?: string;
  explorerUrl?: string;
  tokenAddress?: string;
  platform?: BlockchainPlatform;
  inscriptionNumber?: number;
}

export interface CollectionOptions {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  externalUrl?: string;
  royalty?: number;
}

export interface MintOptions {
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  platform?: BlockchainPlatform;
  useArweave?: boolean;
  enableVoiceCommands?: boolean;
  voiceCommand?: string;
  useDnaService?: boolean;
  launchToken?: boolean;
}

export class NFTService {
  private connection: Connection;
  private metaplex: Metaplex;
  private payer: Keypair;
  private dnaService?: DNAService;
  private execPromise = promisify(exec);

  constructor(
    rpcEndpoint?: string,
    payerPrivateKey?: string | Uint8Array,
    options: { useDnaService?: boolean; retryOptions?: { maxRetries?: number; retryDelay?: number; timeout?: number } } = {}
  ) {
    this.connection = new Connection(rpcEndpoint || process.env.SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta'), 'confirmed');
    const privateKey = payerPrivateKey || process.env.WALLET_PRIVATE_KEY;
    if (!privateKey) throw new Error('No private key provided. Set WALLET_PRIVATE_KEY or pass as parameter.');

    this.payer = typeof privateKey === 'string' ? Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey.replace(/[^a-zA-Z0-9]/g, ''), 'base64'))) : Keypair.fromSecretKey(privateKey);
    this.metaplex = Metaplex.make(this.connection)
      .use(keypairIdentity(this.payer));

    if (options.useDnaService) {
      if (!process.env.NVIDIA_NIM_API_KEY) throw new Error('NVIDIA_NIM_API_KEY not set for DNA service.');
      this.dnaService = new DNAService(process.env.NVIDIA_NIM_API_KEY);
    }
  }

  async getBalance(platform: BlockchainPlatform = BlockchainPlatform.SOLANA): Promise<number> {
    try {
      switch (platform) {
        case BlockchainPlatform.SOLANA:
          return (await this.connection.getBalance(this.payer.publicKey)) / 1_000_000_000;
        case BlockchainPlatform.BITCOIN:
          const { stdout } = await this.execPromise('ord wallet balance');
          const btcBalance = parseFloat(stdout.trim());
          return isNaN(btcBalance) ? 0 : btcBalance;
        default:
          throw new Error(`Balance check not supported for ${platform}`);
      }
    } catch (error) {
      console.error(`Error getting ${platform} balance:`, error);
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createCollection(options: CollectionOptions): Promise<string> {
    try {
      const imagePath = options.image || await this.createPlaceholderImage(options.name);
      const result = await this.mintNFT(
        { name: options.name, symbol: options.symbol, description: options.description, externalUrl: options.externalUrl, royalty: options.royalty, attributes: [{ trait_type: 'Type', value: 'Collection' }] },
        imagePath,
        { retry: true }
      );
      if (!result.success || !result.mintAddress) throw new Error(result.error || 'Unknown error');
      return result.mintAddress;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error(`Collection creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async mintNFT(metadata: NFTMetadata, imagePath: string, options: MintOptions = {}): Promise<NFTMintResult> {
    const platform = options.platform || metadata.platform || BlockchainPlatform.SOLANA;
    try {
      if (!fs.existsSync(imagePath)) throw new Error(`Image file not found at ${imagePath}`);
      return options.retry
        ? await this.retry(() => this.mintNFTInternal(metadata, imagePath, options), options.maxRetries || MAX_RETRIES, options.retryDelay || RETRY_DELAY)
        : await this.mintNFTInternal(metadata, imagePath, options);
    } catch (error) {
      console.error(`Error minting NFT on ${platform}:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error), platform };
    }
  }

  private async mintNFTInternal(metadata: NFTMetadata, imagePath: string, options: MintOptions): Promise<NFTMintResult> {
    const platform = options.platform || metadata.platform || BlockchainPlatform.SOLANA;
    switch (platform) {
      case BlockchainPlatform.SOLANA:
        return await this.mintSolanaNFT(metadata, imagePath, options);
      case BlockchainPlatform.BITCOIN:
        return await this.mintOrdinalInscription(metadata, imagePath, options);
      case BlockchainPlatform.ETHEREUM:
        return await this.mintEthereumNFT(metadata, imagePath, options);
      default:
        throw new Error(`Platform ${platform} not supported`);
    }
  }

  private async mintSolanaNFT(metadata: NFTMetadata, imagePath: string, options: MintOptions): Promise<NFTMintResult> {
    if (options.useDnaService && this.dnaService && !metadata.agentDNA) {
      const dnaOptions: DNAGenerationOptions = {
        temperature: 0.7,
        maxTokens: 200,
        topK: 40,
        startSequence: metadata.name.replace(/[^A-Za-z]/g, '').substring(0, 10).toUpperCase()
      };
      const dnaResult = await this.dnaService.generateDNA(dnaOptions);
      metadata.agentDNA = dnaResult.sequence;
      metadata.attributes = [...(metadata.attributes || []), { trait_type: 'DNA Hash', value: dnaResult.hash.substring(0, 8) }];
    }

    if (options.enableVoiceCommands && options.voiceCommand) {
      metadata.voiceCommand = this.processVoiceCommand(options.voiceCommand);
    }

    const buffer = fs.readFileSync(imagePath);
    const file = toMetaplexFile(buffer, path.basename(imagePath));
    const imageUri = await this.metaplex.storage().upload(file);
    const metadataJson = this.prepareMetadataJson(metadata, imageUri);
    const metadataUri = await this.metaplex.storage().uploadJson(metadataJson);
    const createNftResult = await this.metaplex.nfts().create({
      uri: metadataUri,
      name: metadata.name,
      symbol: metadata.symbol,
      sellerFeeBasisPoints: (metadata.royalty || 0) * 100,
      tokenStandard: TokenStandard.NonFungible,
      ...(metadata.collectionAddress ? { collection: new PublicKey(metadata.collectionAddress) } : {})
    });

    const mintAddress = createNftResult.nft.address.toString();
    let tokenAddress: string | undefined;
    if (options.launchToken && metadata.tokenLaunch) tokenAddress = await this.launchToken(mintAddress, metadata.tokenLaunch);

    return {
      success: true,
      mintAddress,
      signature: createNftResult.response?.signature?.toString() || '', // Use response.signature instead of signature
      metadataUri,
      tokenAddress,
      platform: BlockchainPlatform.SOLANA,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=${this.connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'}`
    };
  }

  private async mintOrdinalInscription(metadata: NFTMetadata, imagePath: string, options: MintOptions): Promise<NFTMintResult> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const metadataPath = path.join(tempDir, `inscription-${Date.now()}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify({ name: metadata.name, description: metadata.description, attributes: metadata.attributes || [], characterData: metadata.characterData, agentDNA: metadata.agentDNA }, null, 2));

    try {
      const { stdout } = await this.execPromise(`ord wallet inscribe --file "${imagePath}" --json-metadata "${metadataPath}"`);
      const match = stdout.match(/inscription: ([a-f0-9]+)i(\d+)/i);
      if (!match) throw new Error('Failed to parse inscription ID');
      const [, inscriptionId, inscriptionNumber] = match;
      return {
        success: true,
        mintAddress: `${inscriptionId}i${inscriptionNumber}`,
        platform: BlockchainPlatform.BITCOIN,
        inscriptionNumber: parseInt(inscriptionNumber, 10),
        explorerUrl: `https://ordinals.com/inscription/${inscriptionId}i${inscriptionNumber}`
      };
    } finally {
      fs.unlinkSync(metadataPath);
    }
  }

  private async mintEthereumNFT(metadata: NFTMetadata, imagePath: string, options: MintOptions): Promise<NFTMintResult> {
    // Placeholder for Ethereum NFT minting (requires web3.js or ethers.js integration)
    throw new Error('Ethereum NFT minting not yet implemented');
  }

  async updateNFT(mintAddress: string, metadata: NFTMetadata, options: MintOptions = {}, imagePath?: string): Promise<NFTMintResult> {
    const platform = options.platform || metadata.platform || BlockchainPlatform.SOLANA;
    try {
      return options.retry
        ? await this.retry(() => this.updateNFTInternal(mintAddress, metadata, imagePath, options), options.maxRetries || MAX_RETRIES, options.retryDelay || RETRY_DELAY)
        : await this.updateNFTInternal(mintAddress, metadata, imagePath, options);
    } catch (error) {
      console.error(`Error updating NFT on ${platform}:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error), platform };
    }
  }

  private async updateNFTInternal(mintAddress: string, metadata: NFTMetadata, imagePath: string | undefined, options: MintOptions): Promise<NFTMintResult> {
    const platform = options.platform || metadata.platform || BlockchainPlatform.SOLANA;
    if (platform !== BlockchainPlatform.SOLANA) throw new Error(`Updating not supported on ${platform}`);
    const mint = new PublicKey(mintAddress);
    let imageUri: string | undefined;
    if (imagePath) {
      if (!fs.existsSync(imagePath)) throw new Error(`Image file not found at ${imagePath}`);
      const buffer = fs.readFileSync(imagePath);
      const file = toMetaplexFile(buffer, path.basename(imagePath));
      imageUri = await this.metaplex.storage().upload(file);
    }

    const nft = await this.metaplex.nfts().findByMint({ mintAddress: mint });
    const existingJson = await axios.get(nft.uri).then(res => res.data).catch(() => ({}));
    const updatedJson = this.prepareMetadataJson(metadata, imageUri || existingJson.image, existingJson);
    const metadataUri = await this.metaplex.storage().uploadJson(updatedJson);
    const updateResult = await this.metaplex.nfts().update({ nftOrSft: nft, uri: metadataUri, name: metadata.name });

    return {
      success: true,
      mintAddress: mintAddress, // Just use the original mintAddress since updateResult doesn't have address property
      metadataUri,
      platform: BlockchainPlatform.SOLANA,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=${this.connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'}`
    };
  }

  private async launchToken(nftAddress: string, tokenParams: { initialSupply: number; tokenName: string; tokenSymbol: string; decimals: number }): Promise<string> {
    // Placeholder for SPL Token creation (requires @solana/spl-token integration)
    console.log(`Launching token for NFT ${nftAddress}:`, tokenParams);
    return `token${Math.floor(Math.random() * 1000000)}`;
  }

  private async retry<T>(fn: () => Promise<T>, maxRetries: number, retryDelay: number): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  private async createPlaceholderImage(name: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const imagePath = path.join(tempDir, `collection-${Date.now()}.png`);
    fs.writeFileSync(imagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
    return imagePath;
  }

  private prepareMetadataJson(metadata: NFTMetadata, imageUri: string, existingJson: any = {}): any {
    return {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: imageUri,
      external_url: metadata.externalUrl || existingJson.external_url || '',
      attributes: [...(existingJson.attributes || []).filter((attr: any) => !metadata.attributes?.some((newAttr: any) => newAttr.trait_type === attr.trait_type)), ...(metadata.attributes || [])],
      properties: {
        files: [{ uri: imageUri, type: 'image/png' }],
        category: 'image',
        creators: [{ address: this.payer.publicKey.toString(), share: 100 }],
        ...Object.fromEntries(Object.entries({ characterData: metadata.characterData, agentDNA: metadata.agentDNA, voiceCommand: metadata.voiceCommand, dnaVisualization: metadata.dnaVisualizationUrl }).filter(([_, v]) => v))
      }
    };
  }

  private processVoiceCommand(command: string): string {
    // Basic voice command processing (expand as needed)
    return command.trim().toLowerCase();
  }
}

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

// Interface definitions
export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  telegram?: string;
  twitter?: string;
  website?: string;
  file: Blob;
}

interface SellResult {
  success: boolean;
  tokenBalanceAfterSell?: number | null | undefined;
  bondingCurve?: any;
}

interface BuyResult {
  success: boolean;
  tokenBalance?: number | null | undefined;
  bondingCurve?: any;
}

interface CreateAndBuyResult {
  success: boolean;
  mintAddress?: string;
  tokenBalance?: number | null | undefined;
  bondingCurve?: any;
}

interface PumpFunServiceOptions {
  rpcUrl?: string;
  walletPath?: string;
}

interface TokenLaunchResult {
  success: boolean;
  tokenAddress?: string;
  tokenBalance?: number;
  pumpfunUrl?: string;
  error?: string;
}

interface TokenTradeResult {
  success: boolean;
  tokenBalance?: number;
  tokenBalanceAfterSell?: number;
  pumpfunUrl?: string;
  error?: string;
}

// PumpFun service class
export class PumpFunService {
  private sdk: any;
  private wallet: Keypair;
  private connection: Connection;
  private readonly SLIPPAGE_BASIS_POINTS = 100n;
  private rpcUrl: string;
  private walletPath: string;

  constructor() {
    this.walletPath = '';
    this.rpcUrl = '';
    this.wallet = Keypair.generate(); // Default empty wallet
    this.connection = new Connection('https://api.mainnet-beta.solana.com'); // Default connection
  }

  async init(options: PumpFunServiceOptions): Promise<void> {
    this.walletPath = options.walletPath || path.join(process.cwd(), 'wallet.json');
    this.rpcUrl = options.rpcUrl || 'https://api.mainnet-beta.solana.com';

    // Load wallet from private key
    try {
      const privateKeyData = fs.readFileSync(this.walletPath, 'utf-8');
      const privateKey = JSON.parse(privateKeyData);
      
      if (Array.isArray(privateKey)) {
        this.wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey));
      } else if (privateKey.secretKey) {
        this.wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey.secretKey));
      } else {
        throw new Error('Invalid private key format');
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error loading wallet:', errorMessage);
      throw new Error(`Failed to load wallet: ${errorMessage}`);
    }

    // Setup connection
    this.connection = new Connection(this.rpcUrl, 'confirmed');
    
    // Create provider
    const provider = new AnchorProvider(
      this.connection,
      { publicKey: this.wallet.publicKey, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs },
      { commitment: 'confirmed' }
    );
    
    // Create SDK instance
    const { PumpFunSDK } = require('/Users/8bit/Desktop/eliza/pumpfun-raydium-cli-tools-main/src/pumpfunsdk/pumpdotfun-sdk/src/pumpfun.js');
    this.sdk = new PumpFunSDK(provider);
  }

  /**
   * Get wallet public key
   */
  getWalletPublicKey(): string {
    return this.wallet.publicKey.toString();
  }

  /**
   * Get SOL balance
   */
  async getSOLBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error getting SOL balance:', errorMessage);
      throw new Error(`Failed to get SOL balance: ${errorMessage}`);
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(mintAddress: string): Promise<number | null> {
    try {
      const { getSPLBalance } = require('/Users/8bit/Desktop/eliza/pumpfun-raydium-cli-tools-main/src/pumpfunsdk/pumpdotfun-sdk/example/util.js');
      return await getSPLBalance(this.connection, new PublicKey(mintAddress), this.wallet.publicKey);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error getting token balance:', errorMessage);
      return null;
    }
  }

  /**
   * Create and buy a token on PumpFun
   */
  async createAndBuyToken(
    mintKeypairPath: string,
    tokenMetadata: TokenMetadata,
    initialBuySolAmount: number
  ): Promise<CreateAndBuyResult> {
    try {
      // Load mint keypair
      const { getKeypairByJsonPath } = require('/Users/8bit/Desktop/eliza/pumpfun-raydium-cli-tools-main/src/pumpfunsdk/pumpdotfun-sdk/example/util.js');
      const mintKeypair = getKeypairByJsonPath(mintKeypairPath);
      const mintAddress = mintKeypair.publicKey.toString();

      // Check if token already exists on PumpFun
      const bondingCurveAccount = await this.sdk.getBondingCurveAccount(mintKeypair.publicKey);
      
      if (bondingCurveAccount) {
        console.log(`Token already exists on PumpFun: https://pump.fun/${mintAddress}`);
        const tokenBalance = await this.getTokenBalance(mintAddress);
        return {
          success: true,
          mintAddress,
          tokenBalance: tokenBalance ?? undefined,
          bondingCurve: bondingCurveAccount
        };
      }

      // Create and buy token
      const createResults = await this.sdk.createAndBuy(
        this.wallet,
        mintKeypair,
        tokenMetadata,
        BigInt(initialBuySolAmount * LAMPORTS_PER_SOL),
        this.SLIPPAGE_BASIS_POINTS,
        {
          unitLimit: 250000,
          unitPrice: 170000,
        }
      );

      if (createResults) {
        console.log(`Token created successfully: https://pump.fun/${mintAddress}`);
        const updatedBondingCurve = await this.sdk.getBondingCurveAccount(mintKeypair.publicKey);
        const tokenBalance = await this.getTokenBalance(mintAddress);
        
        return {
          success: true,
          mintAddress,
          tokenBalance: tokenBalance ?? undefined,
          bondingCurve: updatedBondingCurve
        };
      } else {
        return { success: false, tokenBalance: undefined };
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error creating and buying token:', errorMessage);
      return { success: false, tokenBalance: undefined };
    }
  }

  /**
   * Buy tokens from PumpFun
   */
  async buyToken(mintAddress: string, solAmount: number): Promise<BuyResult> {
    try {
      const mintPubKey = new PublicKey(mintAddress);
      
      const buyResults = await this.sdk.buy(
        this.wallet,
        mintPubKey,
        BigInt(solAmount * LAMPORTS_PER_SOL),
        this.SLIPPAGE_BASIS_POINTS,
        {
          unitLimit: 250000,
          unitPrice: 250000,
        }
      );

      if (buyResults.success) {
        const tokenBalance = await this.getTokenBalance(mintAddress);
        const bondingCurve = await this.sdk.getBondingCurveAccount(mintPubKey);
        
        return {
          success: true,
          tokenBalance: tokenBalance ?? undefined,
          bondingCurve
        };
      } else {
        return { success: false, tokenBalance: undefined };
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error buying token:', errorMessage);
      return { success: false, tokenBalance: undefined };
    }
  }

  /**
   * Sell tokens on PumpFun
   */
  async sellToken(mintAddress: string, sellPercentage: number): Promise<SellResult> {
    try {
      const mintPubKey = new PublicKey(mintAddress);
      const { DEFAULT_DECIMALS } = require('/Users/8bit/Desktop/eliza/pumpfun-raydium-cli-tools-main/src/pumpfunsdk/pumpdotfun-sdk/src/pumpfun.js');
      
      // Get current token balance
      const currentTokenBalance = await this.getTokenBalance(mintAddress);
      
      if (!currentTokenBalance) {
        return { success: false, tokenBalanceAfterSell: undefined };
      }
      
      const sellResults = await this.sdk.sell(
        this.wallet,
        mintPubKey,
        BigInt(currentTokenBalance * Math.pow(10, DEFAULT_DECIMALS) * sellPercentage),
        this.SLIPPAGE_BASIS_POINTS,
        {
          unitLimit: 250000,
          unitPrice: 250000,
        }
      );

      if (sellResults.success) {
        const tokenBalanceAfterSell = await this.getTokenBalance(mintAddress);
        const bondingCurve = await this.sdk.getBondingCurveAccount(mintPubKey);
        
        return {
          success: true,
          tokenBalanceAfterSell: tokenBalanceAfterSell ?? undefined,
          bondingCurve
        };
      } else {
        return { success: false, tokenBalanceAfterSell: undefined };
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error selling token:', errorMessage);
      return { success: false, tokenBalanceAfterSell: undefined };
    }
  }

  /**
   * Generate a new mint keypair and save it to a file
   */
  async generateMintKeypair(outputPath: string): Promise<string> {
    try {
      // Create directories if they don't exist
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate new keypair
      const mintKeypair = Keypair.generate();
      
      // Save to file
      fs.writeFileSync(
        outputPath,
        JSON.stringify(Array.from(mintKeypair.secretKey)),
        'utf-8'
      );
      
      return mintKeypair.publicKey.toString();
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error generating mint keypair:', errorMessage);
      throw new Error(`Failed to generate mint keypair: ${errorMessage}`);
    }
  }
}

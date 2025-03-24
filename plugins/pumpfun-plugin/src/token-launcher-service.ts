import { PumpFunAgentIntegration } from './agent-integration';
// Define a simple interface for keypair instead of importing from @solana/web3.js
interface KeypairInterface {
  publicKey: { toString: () => string };
  secretKey: Uint8Array;
}

// Mock Keypair class for generating keypairs
class Keypair implements KeypairInterface {
  publicKey: { toString: () => string };
  secretKey: Uint8Array;

  constructor(pubKey: string, secretKey: Uint8Array) {
    this.publicKey = { toString: () => pubKey };
    this.secretKey = secretKey;
  }

  static generate(): KeypairInterface {
    // Create a random keypair (just for simulation)
    const secretKey = new Uint8Array(64).map(() => Math.floor(Math.random() * 256));
    const pubKey = `SolanaPublicKey${Math.random().toString(36).substring(2, 15)}`;
    return new Keypair(pubKey, secretKey);
  }
}
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Configuration directories
const CONFIG_DIR = path.join(os.homedir(), '.config', 'eliza', 'pumpfun');
const WALLET_DIR = path.join(CONFIG_DIR, 'wallets');
const IMAGES_DIR = path.join(CONFIG_DIR, 'images');
const TOKEN_DIR = path.join(CONFIG_DIR, 'tokens');

// Configuration file for storing wallet info
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default RPC URL
const DEFAULT_RPC_URL = 'https://api.mainnet-beta.solana.com';

// Retry settings
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export interface TokenLaunchOptions {
  name: string;
  symbol: string;
  description: string;
  initialBuyAmount: number;
  image: Buffer | string;
  imageName?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  generateViaAgent?: boolean;
}

export interface TokenTradeOptions {
  tokenAddress: string;
  solAmount?: number;
  percentage?: number;
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface TokenResult {
  success: boolean;
  error?: string;
  tokenAddress?: string;
  tokenBalance?: number;
  txId?: string;
  pumpfunUrl?: string;
  imageUrl?: string;
}

export interface WalletResult {
  success: boolean;
  error?: string;
  address?: string;
  balance?: number;
  name?: string;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  balance: number;
  price: number;
  value: number;
  launchDate: string;
  pumpfunUrl?: string;
  imageUrl?: string;
}

export class TokenLauncherService {
  private pumpFunAgent: PumpFunAgentIntegration | null = null;
  private config: {
    rpcUrl: string;
    activeWallet: string | null;
    wallets: Array<{ name: string, path: string }>;
  };
  
  constructor() {
    // Ensure directories exist
    [CONFIG_DIR, WALLET_DIR, IMAGES_DIR, TOKEN_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Initialize or load configuration
    if (!fs.existsSync(CONFIG_FILE)) {
      this.config = {
        rpcUrl: DEFAULT_RPC_URL,
        activeWallet: null,
        wallets: []
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } else {
      this.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    
    // Initialize agent if wallet is configured
    this.initializeAgent();
  }
  
  /**
   * Initialize the PumpFun agent
   */
  private initializeAgent() {
    if (!this.config.activeWallet) {
      console.log('No active wallet configured');
      return;
    }
    
    const activeWalletInfo = this.config.wallets.find(w => w.name === this.config.activeWallet);
    if (!activeWalletInfo) {
      console.log('Active wallet not found in configuration');
      return;
    }
    
    try {
      this.pumpFunAgent = new PumpFunAgentIntegration(
        activeWalletInfo.path,
        this.config.rpcUrl,
        TOKEN_DIR
      );
      console.log('PumpFun agent initialized successfully with wallet:', this.config.activeWallet);
    } catch (error) {
      console.error('Failed to initialize PumpFun agent:', error);
    }
  }
  
  /**
   * Get wallet information
   */
  async getWallet(): Promise<WalletResult> {
    if (!this.pumpFunAgent) {
      return await this.setupWallet();
    }
    
    try {
      const walletInfo = await this.pumpFunAgent.getWalletInfo();
      const lines = walletInfo.split('\n');
      const addressLine = lines.find(line => line.includes('Wallet Address:'));
      const balanceLine = lines.find(line => line.includes('SOL Balance:'));
      
      if (!addressLine || !balanceLine) {
        return {
          success: false,
          error: 'Failed to parse wallet information'
        };
      }
      
      const address = addressLine.replace('Wallet Address:', '').trim();
      const balance = parseFloat(balanceLine.replace('SOL Balance:', '').replace('SOL', '').trim());
      
      return {
        success: true,
        address,
        balance,
        name: this.config.activeWallet || undefined
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Set up a new wallet or use an existing one
   */
  async setupWallet(name?: string): Promise<WalletResult> {
    try {
      // Generate wallet name if not provided
      const walletName = name || `wallet-${uuidv4().substring(0, 8)}`;
      const walletPath = path.join(WALLET_DIR, `${walletName}.json`);
      
      // If wallet already exists with this name, use it
      const existingWallet = this.config.wallets.find(w => w.name === walletName);
      if (existingWallet) {
        this.config.activeWallet = walletName;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
        this.initializeAgent();
        
        return await this.getWallet();
      }
      
      // For now, we'll assume wallet exists in the pumpfun-raydium-cli-tools-main directory
      const externalWalletPath = path.join(
        process.cwd(), '..', '..', 'pumpfun-raydium-cli-tools-main', 'data', 'payer_keypair', 'dev-wallet.json'
      );
      
      if (fs.existsSync(externalWalletPath)) {
        // Copy the wallet file
        fs.copyFileSync(externalWalletPath, walletPath);
        
        // Update config
        this.config.wallets.push({ name: walletName, path: walletPath });
        this.config.activeWallet = walletName;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
        
        // Initialize agent
        this.initializeAgent();
        
        return await this.getWallet();
      } else {
        // Try to create a new wallet
        const newKeypair = Keypair.generate();
        fs.writeFileSync(
          walletPath,
          JSON.stringify(Array.from(newKeypair.secretKey)),
          'utf-8'
        );
        
        // Update config
        this.config.wallets.push({ name: walletName, path: walletPath });
        this.config.activeWallet = walletName;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
        
        // Initialize agent
        this.initializeAgent();
        
        return {
          success: true,
          address: newKeypair.publicKey.toString(),
          balance: 0,
          name: walletName
        };
      }
    } catch (error) {
      console.error('Error setting up wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Launch a new token
   */
  async launchToken(options: TokenLaunchOptions): Promise<TokenResult> {
    // Ensure agent is initialized
    if (!this.pumpFunAgent) {
      const walletSetup = await this.setupWallet();
      if (!walletSetup.success) {
        return {
          success: false,
          error: 'Cannot launch token: ' + walletSetup.error
        };
      }
    }
    
    try {
      // Retry logic
      return options.retry
        ? await this.retry(() => this.launchTokenInternal(options), options.maxRetries || MAX_RETRIES, options.retryDelay || RETRY_DELAY)
        : await this.launchTokenInternal(options);
    } catch (error) {
      console.error('Error launching token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Internal method to launch a token
   */
  private async launchTokenInternal(options: TokenLaunchOptions): Promise<TokenResult> {
    // Save image to disk if provided as buffer
    let imagePath: string;
    if (typeof options.image === 'string') {
      if (!fs.existsSync(options.image)) {
        return {
          success: false,
          error: `Image file not found at ${options.image}`
        };
      }
      imagePath = options.image;
    } else {
      const imageName = options.imageName || `${options.symbol.toLowerCase()}-${Date.now()}.png`;
      imagePath = path.join(IMAGES_DIR, imageName);
      fs.writeFileSync(imagePath, options.image);
    }
    
    // Launch token
    const launchResult = await this.pumpFunAgent!.launchToken(
      options.name,
      options.symbol,
      options.description,
      options.initialBuyAmount,
      imagePath,
      options.telegram,
      options.twitter,
      options.website
    );
    
    // Parse the result
    if (launchResult.includes('Successfully launched token')) {
      const tokenAddress = launchResult
        .split('\n')
        .find(line => line.includes('Token Address:'))
        ?.replace('Token Address:', '')
        .trim();
      
      const tokenBalance = launchResult
        .split('\n')
        .find(line => line.includes('Initial Balance:'))
        ?.replace('Initial Balance:', '')
        .trim();
      
      const pumpfunUrl = launchResult
        .split('\n')
        .find(line => line.includes('PumpFun URL:'))
        ?.replace('PumpFun URL:', '')
        .trim();
      
      const imageName = path.basename(imagePath);
      const imageUrl = `/api/token/image/${imageName}`;
      
      return {
        success: true,
        tokenAddress,
        tokenBalance: tokenBalance ? parseFloat(tokenBalance) : undefined,
        pumpfunUrl,
        imageUrl
      };
    } else {
      return {
        success: false,
        error: 'Failed to launch token: ' + launchResult
      };
    }
  }
  
  /**
   * Buy tokens
   */
  async buyToken(options: TokenTradeOptions): Promise<TokenResult> {
    // Ensure agent is initialized
    if (!this.pumpFunAgent) {
      const walletSetup = await this.setupWallet();
      if (!walletSetup.success) {
        return {
          success: false,
          error: 'Cannot buy token: ' + walletSetup.error
        };
      }
    }
    
    if (!options.solAmount || options.solAmount <= 0) {
      return {
        success: false,
        error: 'Invalid SOL amount'
      };
    }
    
    try {
      // Retry logic
      return options.retry
        ? await this.retry(() => this.buyTokenInternal(options), options.maxRetries || MAX_RETRIES, options.retryDelay || RETRY_DELAY)
        : await this.buyTokenInternal(options);
    } catch (error) {
      console.error('Error buying token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Internal method to buy tokens
   */
  private async buyTokenInternal(options: TokenTradeOptions): Promise<TokenResult> {
    // Buy token
    const buyResult = await this.pumpFunAgent!.buyToken(options.tokenAddress, options.solAmount!);
    
    // Parse the result
    if (buyResult.includes('Successfully bought tokens')) {
      const tokenBalance = buyResult
        .split('\n')
        .find(line => line.includes('New Token Balance:'))
        ?.replace('New Token Balance:', '')
        .trim();
      
      const pumpfunUrl = buyResult
        .split('\n')
        .find(line => line.includes('PumpFun URL:'))
        ?.replace('PumpFun URL:', '')
        .trim();
      
      return {
        success: true,
        tokenAddress: options.tokenAddress,
        tokenBalance: tokenBalance ? parseFloat(tokenBalance) : undefined,
        pumpfunUrl,
        txId: 'BUY_TX_' + Date.now()
      };
    } else {
      return {
        success: false,
        error: 'Failed to buy token: ' + buyResult
      };
    }
  }
  
  /**
   * Sell tokens
   */
  async sellToken(options: TokenTradeOptions): Promise<TokenResult> {
    // Ensure agent is initialized
    if (!this.pumpFunAgent) {
      const walletSetup = await this.setupWallet();
      if (!walletSetup.success) {
        return {
          success: false,
          error: 'Cannot sell token: ' + walletSetup.error
        };
      }
    }
    
    if (!options.percentage || options.percentage <= 0 || options.percentage > 100) {
      return {
        success: false,
        error: 'Invalid percentage (must be between 1 and 100)'
      };
    }
    
    try {
      // Retry logic
      return options.retry
        ? await this.retry(() => this.sellTokenInternal(options), options.maxRetries || MAX_RETRIES, options.retryDelay || RETRY_DELAY)
        : await this.sellTokenInternal(options);
    } catch (error) {
      console.error('Error selling token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Internal method to sell tokens
   */
  private async sellTokenInternal(options: TokenTradeOptions): Promise<TokenResult> {
    // Sell token
    const sellResult = await this.pumpFunAgent!.sellToken(options.tokenAddress, options.percentage!);
    
    // Parse the result
    if (sellResult.includes('Successfully sold tokens')) {
      const tokenBalance = sellResult
        .split('\n')
        .find(line => line.includes('Remaining Token Balance:'))
        ?.replace('Remaining Token Balance:', '')
        .trim();
      
      const pumpfunUrl = sellResult
        .split('\n')
        .find(line => line.includes('PumpFun URL:'))
        ?.replace('PumpFun URL:', '')
        .trim();
      
      return {
        success: true,
        tokenAddress: options.tokenAddress,
        tokenBalance: tokenBalance ? parseFloat(tokenBalance) : undefined,
        pumpfunUrl,
        txId: 'SELL_TX_' + Date.now()
      };
    } else {
      return {
        success: false,
        error: 'Failed to sell token: ' + sellResult
      };
    }
  }
  
  /**
   * List tokens
   */
  async listTokens(): Promise<{ success: boolean; tokens?: TokenInfo[]; error?: string }> {
    // Ensure agent is initialized
    if (!this.pumpFunAgent) {
      const walletSetup = await this.setupWallet();
      if (!walletSetup.success) {
        return {
          success: false,
          error: 'Cannot list tokens: ' + walletSetup.error
        };
      }
    }
    
    try {
      // List tokens
      const listResult = await this.pumpFunAgent!.listTokens();
      
      // Parse the result
      if (listResult.includes('Tokens launched by this wallet:')) {
        const tokenEntries = listResult.split('\n\n').slice(1);
        const tokens = tokenEntries.map(entry => {
          const lines = entry.split('\n');
          const token: Partial<TokenInfo> = {};
          
          lines.forEach(line => {
            if (line.includes('Name:')) {
              token.name = line.replace('Name:', '').trim();
            } else if (line.includes('Symbol:')) {
              token.symbol = line.replace('Symbol:', '').trim();
            } else if (line.includes('Address:')) {
              token.address = line.replace('Address:', '').trim();
            } else if (line.includes('Launch Date:')) {
              token.launchDate = new Date(line.replace('Launch Date:', '').trim()).toISOString();
            } else if (line.includes('PumpFun URL:')) {
              token.pumpfunUrl = line.replace('PumpFun URL:', '').trim();
            }
          });
          
          // Get token balance from external API (mocked for now)
          token.balance = Math.floor(Math.random() * 1000000);
          token.price = 0.0000001 * (1 + Math.random());
          token.value = token.balance! * token.price;
          
          return token as TokenInfo;
        });
        
        return {
          success: true,
          tokens
        };
      } else if (listResult.includes('No tokens have been launched by this wallet.')) {
        return {
          success: true,
          tokens: []
        };
      } else {
        return {
          success: false,
          error: 'Failed to list tokens: ' + listResult
        };
      }
    } catch (error) {
      console.error('Error listing tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Helper method to retry operations
   */
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
}

// Export a singleton instance
export const tokenLauncherService = new TokenLauncherService();

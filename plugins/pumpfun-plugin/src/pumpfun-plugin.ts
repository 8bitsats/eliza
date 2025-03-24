import { PumpFunService, TokenMetadata } from './pumpfun-service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PumpFun Plugin for launching and trading tokens on PumpFun via an agent
 */
export class PumpFunPlugin {
  private service: PumpFunService;
  private configPath: string;
  
  /**
   * Constructor for PumpFunPlugin
   * @param privateKeyPath Path to the wallet private key file
   * @param rpcUrl Solana RPC URL
   * @param configDir Directory to store configuration and generated files
   */
  constructor(privateKeyPath: string, rpcUrl: string, configDir: string) {
    this.service = new PumpFunService(privateKeyPath, rpcUrl);
    this.configPath = configDir;
    
    // Ensure config directory exists
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath, { recursive: true });
    }
  }

  /**
   * Get wallet info including address and balance
   */
  async getWalletInfo(): Promise<{ address: string; balance: number }> {
    const address = this.service.getWalletPublicKey();
    const balance = await this.service.getSOLBalance();
    return { address, balance };
  }

  /**
   * Launch a new token on PumpFun
   * @param name Token name
   * @param symbol Token symbol
   * @param description Token description
   * @param initialBuyAmount Initial buy amount in SOL
   * @param imagePath Path to token image file
   * @param metadata Additional metadata (telegram, twitter, website)
   */
  async launchToken(
    name: string,
    symbol: string,
    description: string,
    initialBuyAmount: number,
    imagePath: string,
    metadata: { telegram?: string; twitter?: string; website?: string }
  ): Promise<any> {
    try {
      // Generate mint keypair
      const mintKeypairPath = path.join(this.configPath, `${symbol.toLowerCase()}_token_keypair.json`);
      await this.service.generateMintKeypair(mintKeypairPath);
      
      // Prepare token metadata
      const imageFile = fs.readFileSync(imagePath);
      const tokenMetadata: TokenMetadata = {
        name,
        symbol,
        description,
        ...metadata,
        file: new Blob([imageFile])
      };
      
      // Create and buy token
      const result = await this.service.createAndBuyToken(
        mintKeypairPath,
        tokenMetadata,
        initialBuyAmount
      );
      
      return {
        success: result.success,
        tokenAddress: result.mintAddress,
        tokenBalance: result.tokenBalance,
        pumpfunUrl: result.mintAddress ? `https://pump.fun/${result.mintAddress}` : undefined,
        keypairPath: mintKeypairPath
      };
    } catch (error) {
      console.error('Error launching token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buy tokens on PumpFun
   * @param tokenAddress Token mint address
   * @param solAmount Amount of SOL to spend
   */
  async buyToken(tokenAddress: string, solAmount: number): Promise<any> {
    try {
      const result = await this.service.buyToken(tokenAddress, solAmount);
      return {
        success: result.success,
        tokenBalance: result.tokenBalance,
        pumpfunUrl: `https://pump.fun/${tokenAddress}`
      };
    } catch (error) {
      console.error('Error buying token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sell tokens on PumpFun
   * @param tokenAddress Token mint address
   * @param sellPercentage Percentage of tokens to sell (0.0 to 1.0)
   */
  async sellToken(tokenAddress: string, sellPercentage: number): Promise<any> {
    try {
      const result = await this.service.sellToken(tokenAddress, sellPercentage);
      return {
        success: result.success,
        tokenBalance: result.tokenBalanceAfterSell,
        pumpfunUrl: `https://pump.fun/${tokenAddress}`
      };
    } catch (error) {
      console.error('Error selling token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get token balance
   * @param tokenAddress Token mint address
   */
  async getTokenBalance(tokenAddress: string): Promise<any> {
    try {
      const balance = await this.service.getTokenBalance(tokenAddress);
      return {
        success: true,
        tokenBalance: balance,
        pumpfunUrl: `https://pump.fun/${tokenAddress}`
      };
    } catch (error) {
      console.error('Error getting token balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

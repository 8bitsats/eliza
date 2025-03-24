import { PumpFunPlugin } from './pumpfun-plugin.js';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Example integration of PumpFun plugin with an agent
 * This class provides methods that the agent can call to interact with PumpFun
 */
export class PumpFunAgentIntegration {
  private plugin: PumpFunPlugin;
  private configDir: string;

  /**
   * Initialize the PumpFun agent integration
   * @param privateKeyPath Path to the wallet private key
   * @param rpcUrl Solana RPC URL
   * @param configDir Directory to store configuration files
   */
  constructor(privateKeyPath: string, rpcUrl: string, configDir: string) {
    this.configDir = configDir;

    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    // Initialize the PumpFun plugin
    this.plugin = new PumpFunPlugin(privateKeyPath, rpcUrl, this.configDir);
  }

  /**
   * Get wallet information
   * @returns Wallet address and SOL balance
   */
  async getWalletInfo(): Promise<string> {
    try {
      const info = await this.plugin.getWalletInfo();
      return `Wallet Address: ${info.address}\nSOL Balance: ${info.balance.toFixed(4)} SOL`;
    } catch (error: any) {
      return `Error getting wallet info: ${error.message}`;
    }
  }

  /**
   * Launch a new token on PumpFun
   * @param name Token name
   * @param symbol Token symbol
   * @param description Token description
   * @param initialBuyAmount Amount of SOL for initial buy
   * @param imagePath Path to token image
   * @param telegram Optional Telegram link
   * @param twitter Optional Twitter link
   * @param website Optional Website link
   * @returns Result of token launch
   */
  async launchToken(
    name: string,
    symbol: string,
    description: string,
    initialBuyAmount: number,
    imagePath: string,
    telegram?: string,
    twitter?: string,
    website?: string
  ): Promise<any> {
    try {
      // Check for required parameters
      if (!name) {
        throw new Error('Token name is required');
      }
      if (!symbol) {
        throw new Error('Token symbol is required');
      }
      if (!description) {
        throw new Error('Token description is required');
      }

      // Check if image exists
      if (!fs.existsSync(imagePath)) {
        return `Error: Image file not found at ${imagePath}`;
      }

      // Launch token
      const result = await this.plugin.launchToken(
        name,
        symbol,
        description,
        initialBuyAmount,
        imagePath,
        { telegram, twitter, website }
      );

      if (result.success) {
        // Save token info to config directory
        const tokenInfoPath = path.join(this.configDir, `${symbol.toLowerCase()}_info.json`);
        fs.writeFileSync(
          tokenInfoPath,
          JSON.stringify({
            name,
            symbol,
            description,
            mintAddress: result.tokenAddress,
            launchDate: new Date().toISOString(),
            initialBuyAmount,
            keypairPath: result.keypairPath,
            pumpfunUrl: result.pumpfunUrl
          }, null, 2),
          'utf-8'
        );

        return {
          success: true,
          tokenAddress: result.tokenAddress,
          tokenBalance: result.tokenBalance,
          pumpfunUrl: result.pumpfunUrl,
          message: `Successfully launched token!\n` +
                 `Token Name: ${name}\n` +
                 `Token Symbol: ${symbol}\n` +
                 `Token Address: ${result.tokenAddress}\n` +
                 `Initial Balance: ${result.tokenBalance}\n` +
                 `PumpFun URL: ${result.pumpfunUrl}\n` +
                 `Token info saved to: ${tokenInfoPath}`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error',
          message: `Failed to launch token: ${result.error || 'Unknown error'}`
        };
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Buy tokens on PumpFun
   * @param tokenAddress Token mint address
   * @param solAmount Amount of SOL to spend
   * @returns Result of token purchase
   */
  async buyToken(tokenAddress: string, solAmount: number): Promise<string> {
    try {
      const result = await this.plugin.buyToken(tokenAddress, solAmount);

      if (result.success) {
        return `Successfully bought tokens!\n` +
               `Token Address: ${tokenAddress}\n` +
               `Amount Spent: ${solAmount} SOL\n` +
               `New Token Balance: ${result.tokenBalance}\n` +
               `PumpFun URL: ${result.pumpfunUrl}`;
      } else {
        return `Failed to buy tokens: ${result.error || 'Unknown error'}`;
      }
    } catch (error: any) {
      return `Error buying tokens: ${error.message}`;
    }
  }

  /**
   * Sell tokens on PumpFun
   * @param tokenAddress Token mint address
   * @param sellPercentage Percentage of tokens to sell (0-100)
   * @returns Result of token sale
   */
  async sellToken(tokenAddress: string, sellPercentage: number): Promise<string> {
    try {
      // Convert percentage from 0-100 to 0-1
      const normalizedPercentage = sellPercentage / 100;

      const result = await this.plugin.sellToken(tokenAddress, normalizedPercentage);

      if (result.success) {
        return `Successfully sold tokens!\n` +
               `Token Address: ${tokenAddress}\n` +
               `Percentage Sold: ${sellPercentage}%\n` +
               `Remaining Token Balance: ${result.tokenBalance}\n` +
               `PumpFun URL: ${result.pumpfunUrl}`;
      } else {
        return `Failed to sell tokens: ${result.error || 'Unknown error'}`;
      }
    } catch (error: any) {
      return `Error selling tokens: ${error.message}`;
    }
  }

  /**
   * Get token balance
   * @param tokenAddress Token mint address
   * @returns Token balance information
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    try {
      const result = await this.plugin.getTokenBalance(tokenAddress);

      if (result.success) {
        return `Token Address: ${tokenAddress}\n` +
               `Token Balance: ${result.tokenBalance}\n` +
               `PumpFun URL: ${result.pumpfunUrl}`;
      } else {
        return `Failed to get token balance: ${result.error || 'Unknown error'}`;
      }
    } catch (error: any) {
      return `Error getting token balance: ${error.message}`;
    }
  }

  /**
   * List all tokens launched by this wallet
   * @returns List of tokens launched by this wallet
   */
  async listTokens(): Promise<string> {
    try {
      // Read all token info files from config directory
      const files = fs.readdirSync(this.configDir);
      const tokenInfoFiles = files.filter(file => file.endsWith('_info.json'));

      if (tokenInfoFiles.length === 0) {
        return 'No tokens have been launched by this wallet.';
      }

      // Build token list
      let result = 'Tokens launched by this wallet:\n\n';

      for (const file of tokenInfoFiles) {
        const filePath = path.join(this.configDir, file);
        const tokenInfo = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        result += `Name: ${tokenInfo.name}\n` +
                 `Symbol: ${tokenInfo.symbol}\n` +
                 `Address: ${tokenInfo.mintAddress}\n` +
                 `Launch Date: ${new Date(tokenInfo.launchDate).toLocaleString()}\n` +
                 `PumpFun URL: ${tokenInfo.pumpfunUrl}\n\n`;
      }

      return result;
    } catch (error: any) {
      return `Error listing tokens: ${error.message}`;
    }
  }
}

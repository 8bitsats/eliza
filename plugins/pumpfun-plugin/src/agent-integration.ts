import { Keypair, Connection } from '@solana/web3.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface TokenInfo {
  name: string;
  symbol: string;
  description: string;
  mintAddress: string;
  launchDate: string;
  initialBuyAmount: number;
  keypairPath: string;
  pumpfunUrl: string;
}

export class PumpFunAgentIntegration {
  private configDir: string;
  private plugin: any;

  constructor(configDir: string) {
    this.configDir = configDir;

    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      try {
        fs.mkdirSync(this.configDir, { recursive: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Error creating config directory: ${errorMessage}`);
      }
    }
  }

  async initializePlugin(rpcUrl: string, walletPath: string): Promise<void> {
    try {
      this.plugin = {
        rpcUrl,
        walletPath,
        options: {
          rpcUrl,
          walletPath
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize plugin: ${errorMessage}`);
    }
  }

  async launchToken(
    name: string,
    symbol: string,
    description: string,
    initialBuyAmount: number,
    decimals: number,
    royaltyBps: number,
    imagePath: string,
    twitter?: string,
    website?: string
  ): Promise<string> {
    try {
      const args = [
        `--name "${name}"`,
        `--symbol ${symbol}`,
        `--description "${description}"`,
        `--initial-buy-amount ${initialBuyAmount}`,
        `--decimals ${decimals}`,
        `--royalty-bps ${royaltyBps}`,
        `--image ${imagePath}`,
        twitter ? `--twitter ${twitter}` : '',
        website ? `--website ${website}` : ''
      ].filter(Boolean);

      const { stdout } = await execAsync(
        `pumpfun launch ${args.join(' ')} --keypair ${this.plugin.walletPath} --url ${this.plugin.rpcUrl}`
      );

      // Save token info
      const tokenInfo: TokenInfo = {
        name,
        symbol,
        description,
        mintAddress: this.extractTokenAddress(stdout),
        launchDate: new Date().toISOString(),
        initialBuyAmount,
        keypairPath: path.join(this.configDir, `${symbol.toLowerCase()}_keypair.json`),
        pumpfunUrl: `https://pump.fun/${this.extractTokenAddress(stdout)}`
      };

      const tokenInfoPath = path.join(this.configDir, `${symbol.toLowerCase()}_info.json`);
      try {
        fs.writeFileSync(tokenInfoPath, JSON.stringify(tokenInfo, null, 2), 'utf-8');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Error saving token info: ${errorMessage}`);
      }

      return stdout;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to launch token: ${errorMessage}`);
    }
  }

  async buyToken(tokenAddress: string, solAmount: number): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `pumpfun buy ${tokenAddress} ${solAmount} --keypair ${this.plugin.walletPath} --url ${this.plugin.rpcUrl}`
      );
      return stdout;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to buy token: ${errorMessage}`);
    }
  }

  async sellToken(tokenAddress: string, percentage: number): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `pumpfun sell ${tokenAddress} ${percentage} --keypair ${this.plugin.walletPath} --url ${this.plugin.rpcUrl}`
      );
      return stdout;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sell token: ${errorMessage}`);
    }
  }

  async listTokens(): Promise<string> {
    try {
      const tokenInfoFiles = fs.readdirSync(this.configDir)
        .filter(file => file.endsWith('_info.json'));

      let result = '';

      for (const file of tokenInfoFiles) {
        const filePath = path.join(this.configDir, file);
        try {
          const tokenInfo = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TokenInfo;
          result += `Name: ${tokenInfo.name}\n` +
                   `Symbol: ${tokenInfo.symbol}\n` +
                   `Address: ${tokenInfo.mintAddress}\n` +
                   `Launch Date: ${new Date(tokenInfo.launchDate).toLocaleString()}\n` +
                   `PumpFun URL: ${tokenInfo.pumpfunUrl}\n\n`;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Error reading token info: ${errorMessage}`);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list tokens: ${errorMessage}`);
    }
  }

  private extractTokenAddress(output: string): string {
    const match = output.match(/Token Address:\s*([^\s\n]+)/);
    if (!match) {
      throw new Error('Could not extract token address from output');
    }
    return match[1];
  }
}

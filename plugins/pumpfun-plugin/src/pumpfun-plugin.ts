import { Plugin, PluginContext } from '@elizaos/core';
import { PumpFunService } from './pumpfun-service.js';
import fs from 'fs';
import path from 'path';

export interface PumpFunPluginOptions {
  rpcUrl?: string;
  walletPath?: string;
}

export class PumpFunPlugin implements Plugin {
  private service: PumpFunService | null = null;
  private options: PumpFunPluginOptions;
  private configPath: string;

  constructor(options: PumpFunPluginOptions = {}) {
    this.options = options;
    this.configPath = path.join(process.cwd(), 'config');
  }

  async init(context: PluginContext): Promise<void> {
    try {
      this.service = new PumpFunService();
      await this.service.init(this.options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize PumpFun plugin: ${errorMessage}`);
    }
  }

  async getWalletInfo(): Promise<{ address: string; balance: number }> {
    try {
      if (!this.service) {
        throw new Error('PumpFun service not initialized');
      }
      const address = this.service.getWalletPublicKey();
      const balance = await this.service.getSOLBalance();
      return { address, balance };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get wallet info: ${errorMessage}`);
    }
  }

  async launchToken(
    name: string,
    symbol: string,
    initialBuyAmount: number,
    imagePath: string,
    metadata: { telegram?: string; twitter?: string; website?: string }
  ): Promise<{
    success: boolean;
    tokenAddress?: string;
    tokenBalance?: number;
    pumpfunUrl?: string;
    keypairPath?: string;
    error?: string;
  }> {
    try {
      if (!this.service) {
        throw new Error('PumpFun service not initialized');
      }

      // Generate mint keypair
      const mintKeypairPath = path.join(this.configPath, `${symbol.toLowerCase()}_token_keypair.json`);

      // Launch token
      const result = await this.service.launchToken(
        name,
        symbol,
        initialBuyAmount,
        imagePath,
        metadata
      );

      return {
        success: true,
        tokenAddress: result.tokenAddress,
        tokenBalance: result.tokenBalance ?? undefined,
        pumpfunUrl: result.pumpfunUrl,
        keypairPath: mintKeypairPath
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to launch token: ${errorMessage}`
      };
    }
  }

  async buyToken(
    tokenAddress: string,
    solAmount: number
  ): Promise<{
    success: boolean;
    tokenBalance?: number;
    pumpfunUrl?: string;
    error?: string;
  }> {
    try {
      if (!this.service) {
        throw new Error('PumpFun service not initialized');
      }

      const result = await this.service.buyToken(tokenAddress, solAmount);
      return {
        success: true,
        tokenBalance: result.tokenBalance ?? undefined,
        pumpfunUrl: `https://pump.fun/${tokenAddress}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to buy token: ${errorMessage}`
      };
    }
  }

  async sellToken(
    tokenAddress: string,
    sellPercentage: number
  ): Promise<{
    success: boolean;
    tokenBalanceAfterSell?: number;
    pumpfunUrl?: string;
    error?: string;
  }> {
    try {
      if (!this.service) {
        throw new Error('PumpFun service not initialized');
      }

      const result = await this.service.sellToken(tokenAddress, sellPercentage);
      return {
        success: true,
        tokenBalanceAfterSell: result.tokenBalanceAfterSell ?? undefined,
        pumpfunUrl: `https://pump.fun/${tokenAddress}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to sell token: ${errorMessage}`
      };
    }
  }

  async getTokenBalance(
    tokenAddress: string
  ): Promise<{
    success: boolean;
    tokenBalance?: number;
    pumpfunUrl?: string;
    error?: string;
  }> {
    try {
      if (!this.service) {
        throw new Error('PumpFun service not initialized');
      }

      const balance = await this.service.getTokenBalance(tokenAddress);
      return {
        success: true,
        tokenBalance: balance ?? undefined,
        pumpfunUrl: `https://pump.fun/${tokenAddress}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to get token balance: ${errorMessage}`
      };
    }
  }
}

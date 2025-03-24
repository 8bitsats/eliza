import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Market, TokenSwap } from '@raydium-io/raydium-sdk';

export interface TradingStrategyConfig {
  tokenAddress: PublicKey;
  marketAddress: PublicKey;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  trailingStopDistance?: number;
  copyTraderAddress?: PublicKey;
}

export class TradingStrategiesService {
  private connection: Connection;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
  }

  async setStopLoss(config: TradingStrategyConfig): Promise<TransactionInstruction> {
    try {
      if (!config.stopLossPrice) {
        throw new Error('Stop loss price is required');
      }

      // Get current market price
      const market = await Market.load(
        this.connection,
        config.marketAddress,
        {},
        config.tokenAddress
      );

      // Create stop loss instruction
      const instruction = await TokenSwap.makeCreateStopLossOrderInstruction({
        market,
        price: config.stopLossPrice,
        owner: window.solana.publicKey,
      });

      return instruction;
    } catch (error) {
      console.error('Error setting stop loss:', error);
      throw error;
    }
  }

  async setTakeProfit(config: TradingStrategyConfig): Promise<TransactionInstruction> {
    try {
      if (!config.takeProfitPrice) {
        throw new Error('Take profit price is required');
      }

      // Get current market price
      const market = await Market.load(
        this.connection,
        config.marketAddress,
        {},
        config.tokenAddress
      );

      // Create take profit instruction
      const instruction = await TokenSwap.makeCreateTakeProfitOrderInstruction({
        market,
        price: config.takeProfitPrice,
        owner: window.solana.publicKey,
      });

      return instruction;
    } catch (error) {
      console.error('Error setting take profit:', error);
      throw error;
    }
  }

  async startCopyTrading(config: TradingStrategyConfig): Promise<TransactionInstruction> {
    try {
      if (!config.copyTraderAddress) {
        throw new Error('Copy trader address is required');
      }

      // Get trader's active positions
      const traderPositions = await this.connection.getTokenAccountsByOwner(
        config.copyTraderAddress,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Create copy trading instruction
      const instruction = await TokenSwap.makeCreateCopyTradeInstruction({
        traderAddress: config.copyTraderAddress,
        market: config.marketAddress,
        owner: window.solana.publicKey,
      });

      return instruction;
    } catch (error) {
      console.error('Error starting copy trading:', error);
      throw error;
    }
  }

  async getMarketPrice(marketAddress: PublicKey): Promise<number> {
    try {
      const market = await Market.load(
        this.connection,
        marketAddress,
        {},
        new PublicKey('11111111111111111111111111111111')
      );

      const price = await market.getCurrentPrice();
      return price;
    } catch (error) {
      console.error('Error getting market price:', error);
      throw error;
    }
  }
}

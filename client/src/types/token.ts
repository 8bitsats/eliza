/**
 * Token-related type definitions
 */

// Interface for a token launched by the user
export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  launchDate: string;
  balance: number;
  price: number;
  value: number;
  pumpfunUrl?: string;
  imageUrl?: string;
}

// Interface for a trending token from the market
export interface TrendingToken {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  imageUrl?: string;
}

// Interface for token visualization data
export interface TokenVisualizerData {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  description: string;
  launchDate: string;
  initialPrice: number;
  currentPrice: number;
  priceHistory?: Array<{ time: string; price: number }>;
  tradeActivity?: Array<{
    type: string;
    amount: number;
    time: string;
    txId: string;
  }>;
  social?: {
    telegram?: string;
    twitter?: string;
    website?: string;
  };
  imageUrl?: string;
}

// Types for wallet operations
export interface WalletInfo {
  success: boolean;
  error?: string;
  address?: string;
  balance?: number;
  name?: string;
}

// API Response types
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TokenListResponse extends ApiResponse {
  tokens?: TokenMetadata[];
}

export interface TokenTrendingResponse extends ApiResponse {
  tokens?: TrendingToken[];
}

export interface TokenLaunchResponse extends ApiResponse {
  tokenAddress?: string;
  imageUrl?: string;
  tokenData?: TokenVisualizerData;
}

export interface TokenTradeResponse extends ApiResponse {
  tokenAddress?: string;
  tokenBalance?: number;
  txId?: string;
}

// Test mode configuration type
export interface TestModeConfig {
  enabled: boolean;
  mode?: 'mock' | 'devnet' | 'disabled';
}

// Form data for token launch
export interface TokenLaunchFormData {
  name: string;
  symbol: string;
  description: string;
  initialBuyAmount: number;
  telegram?: string;
  twitter?: string;
  website?: string;
  image?: File;
}

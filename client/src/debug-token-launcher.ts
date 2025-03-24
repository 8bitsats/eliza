/**
 * Debug script for testing the token launcher system
 * Run this to test different token launcher functionality
 */

import { TokenMetadata, TrendingToken, TokenVisualizerData, TestModeConfig } from './types/token';
import { logInfo, logError, logDebug } from './utils/debug-utils';

// Sample test data
const sampleTokens: TokenMetadata[] = [
  {
    address: 'DEV123456789abcdef',
    name: 'Debug Token',
    symbol: 'DEBUG',
    description: 'Token for debugging the launcher',
    launchDate: new Date().toISOString(),
    balance: 1000,
    price: 0.05,
    value: 50,
    imageUrl: 'https://via.placeholder.com/150'
  },
  {
    address: 'TEST987654321abcdef',
    name: 'Test Token',
    symbol: 'TEST',
    description: 'Another token for testing',
    launchDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
    balance: 500,
    price: 0.1,
    value: 50,
    imageUrl: 'https://via.placeholder.com/150/ff0000'
  }
];

const sampleTrendingTokens: TrendingToken[] = [
  {
    address: 'TREND123456789abcdef',
    name: 'Trending Token 1',
    symbol: 'TREND1',
    price: 2.5,
    priceChange24h: 15.2,
    volume24h: 1500000,
    marketCap: 25000000,
    imageUrl: 'https://via.placeholder.com/150/00ff00'
  },
  {
    address: 'TREND987654321abcdef',
    name: 'Trending Token 2',
    symbol: 'TREND2',
    price: 0.75,
    priceChange24h: -5.8,
    volume24h: 750000,
    marketCap: 8000000,
    imageUrl: 'https://via.placeholder.com/150/0000ff'
  }
];

// Function to test token list loading
export const testTokenList = (testMode: TestModeConfig) => {
  logInfo('token-list', 'Testing token list loading', { testMode });
  try {
    // Simulate API loading
    if (!testMode.enabled) {
      logInfo('token-list', 'Using production API for token list');
      // In real implementation this would call the actual API
    } else if (testMode.mode === 'mock') {
      logInfo('token-list', 'Using mock data for token list', { tokens: sampleTokens });
      return { success: true, tokens: sampleTokens };
    } else if (testMode.mode === 'devnet') {
      logInfo('token-list', 'Using devnet API for token list');
      // In real implementation this would call the devnet API
    }
    return { success: true, tokens: [] };
  } catch (error) {
    logError('token-list', 'Error loading token list', error);
    return { success: false, error: 'Failed to load token list' };
  }
};

// Function to test token trading
export const testTokenTrading = (tokenAddress: string, amount: number, isBuy: boolean, testMode: TestModeConfig) => {
  const action = isBuy ? 'buy' : 'sell';
  logInfo('trade-token', `Testing token ${action}`, { tokenAddress, amount, testMode });
  
  try {
    // Simulate API call
    if (!testMode.enabled) {
      logInfo('trade-token', `Using production API for token ${action}`);
      // In real implementation this would call the actual API
    } else if (testMode.mode === 'mock') {
      logInfo('trade-token', `Using mock data for token ${action}`);
      // Return success with dummy transaction ID
      return { 
        success: true, 
        tokenAddress, 
        tokenBalance: isBuy ? 100 : 0,
        txId: 'mock_tx_' + Date.now() 
      };
    } else if (testMode.mode === 'devnet') {
      logInfo('trade-token', `Using devnet API for token ${action}`);
      // In real implementation this would call the devnet API
    }
    
    return { success: true, tokenAddress, tokenBalance: 0, txId: 'test_tx_' + Date.now() };
  } catch (error) {
    logError('trade-token', `Error ${action} token`, error);
    return { success: false, error: `Failed to ${action} token` };
  }
};

// Function to test launching a token
export const testTokenLaunch = (tokenData: any, testMode: TestModeConfig) => {
  logInfo('launch-token', 'Testing token launch', { tokenData, testMode });
  
  try {
    // Validate token data
    if (!tokenData.name || !tokenData.symbol) {
      logError('launch-token', 'Invalid token data for launch', { tokenData });
      return { success: false, error: 'Token name and symbol are required' };
    }
    
    // Simulate API call
    if (!testMode.enabled) {
      logInfo('launch-token', 'Using production API for token launch');
      // In real implementation this would call the actual API
    } else if (testMode.mode === 'mock') {
      logInfo('launch-token', 'Using mock data for token launch');
      
      // Create a mock token response
      const mockTokenData: TokenVisualizerData = {
        tokenName: tokenData.name,
        tokenSymbol: tokenData.symbol,
        tokenAddress: 'LAUNCH' + Date.now().toString(16),
        description: tokenData.description || '',
        launchDate: new Date().toISOString(),
        initialPrice: 0.01,
        currentPrice: 0.01,
        imageUrl: tokenData.imageUrl || 'https://via.placeholder.com/150/ffff00'
      };
      
      return { success: true, tokenAddress: mockTokenData.tokenAddress, tokenData: mockTokenData };
    } else if (testMode.mode === 'devnet') {
      logInfo('launch-token', 'Using devnet API for token launch');
      // In real implementation this would call the devnet API
    }
    
    return { success: true, tokenAddress: 'test_launch_' + Date.now() };
  } catch (error) {
    logError('launch-token', 'Error launching token', error);
    return { success: false, error: 'Failed to launch token' };
  }
};

// Function to test trending tokens
export const testTrendingTokens = (limit: number, timeframe: string, testMode: TestModeConfig) => {
  logInfo('trending-tokens', 'Testing trending tokens', { limit, timeframe, testMode });
  
  try {
    // Simulate API call
    if (!testMode.enabled) {
      logInfo('trending-tokens', 'Using production API for trending tokens');
      // In real implementation this would call the actual API
    } else if (testMode.mode === 'mock') {
      logInfo('trending-tokens', 'Using mock data for trending tokens');
      return { success: true, tokens: sampleTrendingTokens.slice(0, limit) };
    } else if (testMode.mode === 'devnet') {
      logInfo('trending-tokens', 'Using devnet API for trending tokens');
      // In real implementation this would call the devnet API
    }
    
    return { success: true, tokens: [] };
  } catch (error) {
    logError('trending-tokens', 'Error fetching trending tokens', error);
    return { success: false, error: 'Failed to fetch trending tokens' };
  }
};

// Main debug function to test all token launcher functionality
export const debugTokenLauncher = () => {
  // Log system info
  logInfo('token-service', 'Starting token launcher debug session', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    buildVersion: process.env.BUILD_VERSION || 'development'
  });
  
  // Test with different modes
  const testModes: TestModeConfig[] = [
    { enabled: false, mode: 'disabled' },
    { enabled: true, mode: 'mock' },
    { enabled: true, mode: 'devnet' }
  ];
  
  // Run tests for each mode
  testModes.forEach(mode => {
    logInfo('test-mode', `Testing with mode: ${mode.enabled ? mode.mode : 'disabled'}`);
    
    // Test token list
    const tokenListResult = testTokenList(mode);
    logDebug('token-list', 'Token list result', tokenListResult);
    
    // Test token trading
    if (tokenListResult.success && tokenListResult.tokens?.length) {
      const tradeResult = testTokenTrading(tokenListResult.tokens[0].address, 10, true, mode);
      logDebug('trade-token', 'Token trading result', tradeResult);
    }
    
    // Test trending tokens
    const trendingResult = testTrendingTokens(5, '24h', mode);
    logDebug('trending-tokens', 'Trending tokens result', trendingResult);
    
    // Test token launch
    const launchResult = testTokenLaunch({
      name: 'Debug Coin',
      symbol: 'DBUG',
      description: 'A token for debugging purposes'
    }, mode);
    logDebug('launch-token', 'Token launch result', launchResult);
  });
  
  logInfo('token-service', 'Token launcher debug session completed');
};

// Export a function to manually invoke the debug session
export const startDebugSession = () => {
  console.log('Starting manual debug session for token launcher...');
  debugTokenLauncher();
  console.log('Debug session completed. Check console logs for details.');
};

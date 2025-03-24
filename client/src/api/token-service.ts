/**
 * Token Service - Handles token-related API calls
 */

// Define test mode interface
export interface TestMode {
  enabled: boolean;
  mode?: string;
}

// Wallet API
export const setupWallet = async (walletName?: string, testMode?: TestMode) => {
  try {
    const url = testMode?.enabled ? '/api/test/token/setup-wallet' : '/api/token/setup-wallet';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletName }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error setting up wallet:', error);
    return {
      success: false,
      message: 'Failed to connect to wallet service',
    };
  }
};

export const getWalletInfo = async (testMode?: TestMode) => {
  try {
    const url = testMode?.enabled ? '/api/test/token/wallet' : '/api/token/wallet';
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error getting wallet info:', error);
    return {
      success: false,
      message: 'Failed to connect to wallet service',
    };
  }
};

// Token API
export const launchToken = async (formData: FormData, testMode?: TestMode) => {
  try {
    const url = testMode?.enabled ? '/api/test/token/launch' : '/api/token/launch';
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Error launching token:', error);
    return {
      success: false,
      message: 'Failed to connect to token service',
    };
  }
};

export const buyToken = async (tokenAddress: string, solAmount: number, testMode?: TestMode) => {
  try {
    const url = testMode?.enabled ? '/api/test/token/buy' : '/api/token/buy';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress,
        solAmount,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error buying token:', error);
    return {
      success: false,
      message: 'Failed to connect to token service',
    };
  }
};

export const sellToken = async (tokenAddress: string, percentage: number, testMode?: TestMode) => {
  try {
    const url = testMode?.enabled ? '/api/test/token/sell' : '/api/token/sell';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress,
        percentage,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error selling token:', error);
    return {
      success: false,
      message: 'Failed to connect to token service',
    };
  }
};

export const listTokens = async (testMode?: TestMode) => {
  try {
    const url = testMode?.enabled ? '/api/test/token/list' : '/api/token/list';
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error listing tokens:', error);
    return {
      success: false,
      message: 'Failed to connect to token service',
      tokens: [],
    };
  }
};

export const getTrendingTokens = async (limit: number = 10, timeframe: string = '24h', testMode?: TestMode) => {
  try {
    const baseUrl = testMode?.enabled ? '/api/test/token/trending' : '/api/token/trending';
    const url = `${baseUrl}?limit=${limit}&timeframe=${timeframe}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error getting trending tokens:', error);
    return {
      success: false,
      message: 'Failed to connect to token service',
      tokens: [],
    };
  }
};

// Token API service interface
export const tokenService = {
  setupWallet,
  getWalletInfo,
  launchToken,
  buyToken,
  sellToken,
  listTokens,
  getTrendingTokens,
};

export default tokenService;

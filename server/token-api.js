 const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

// Import the token launcher service
const { tokenLauncherService } = require('../plugins/pumpfun-plugin/dist/token-launcher-service');

// Import the fal.ai API router
const falApiRouter = require('./fal-api');

// Create the Express app
const app = express();
app.use(express.json());
app.use(cors());

// Solana Tracker API configuration
const SOLANA_TRACKER_API_KEY = process.env.SOLANA_TRACKER_API_KEY || 'your-api-key';
const SOLANA_TRACKER_BASE_URL = 'https://api.solanatracker.io/v1';

// Set up file upload middleware
const upload = multer({ 
  dest: 'temp-uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Configuration directories
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'eliza', 'pumpfun');
const IMAGES_DIR = path.join(CONFIG_DIR, 'images');

// Ensure directories exist
[CONFIG_DIR, IMAGES_DIR, 'temp-uploads'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve token images
app.use('/api/token/image', express.static(IMAGES_DIR));

// Use the fal.ai API router
app.use('/api/fal', falApiRouter);

// Setup or get wallet info
app.post('/api/token/setup-wallet', async (req, res) => {
  try {
    const { walletName } = req.body;
    const result = await tokenLauncherService.setupWallet(walletName);
    res.json(result);
  } catch (error) {
    console.error('Error setting up wallet:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// Get wallet info
app.get('/api/token/wallet', async (req, res) => {
  try {
    const result = await tokenLauncherService.getWallet();
    res.json(result);
  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// Launch token
app.post('/api/token/launch', upload.single('image'), async (req, res) => {
  try {
    const { name, symbol, description, initialBuyAmount, telegram, twitter, website } = req.body;
    const image = req.file;
    
    if (!name || !symbol || !description || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, symbol, description, and image are required'
      });
    }
    
    // Launch token using the service
    const result = await tokenLauncherService.launchToken({
      name,
      symbol,
      description,
      initialBuyAmount: parseFloat(initialBuyAmount) || 0.5,
      image: fs.readFileSync(image.path),
      imageName: `${symbol.toLowerCase()}-${Date.now()}.${path.extname(image.originalname)}`,
      telegram,
      twitter,
      website,
      retry: true
    });
    
    if (result.success) {
      // Create visualization data
      const launchDate = new Date().toISOString();
      const mockData = {
        tokenName: name,
        tokenSymbol: symbol,
        tokenAddress: result.tokenAddress || "SIMULATED_ADDRESS_123456",
        description,
        launchDate,
        initialPrice: 0.00001,
        currentPrice: 0.00001,
        priceHistory: [{ time: launchDate, price: 0.00001 }],
        tradeActivity: [
          {
            type: "launch",
            amount: parseFloat(initialBuyAmount) || 0.5,
            time: launchDate,
            txId: result.txId || "LAUNCH_TX_" + Date.now()
          }
        ],
        social: {
          telegram,
          twitter,
          website
        },
        imageUrl: result.imageUrl || `/api/token/image/${path.basename(image.originalname)}`,
        marketCap: (parseFloat(initialBuyAmount) || 0.5) * 100000,
        volume24h: parseFloat(initialBuyAmount) || 0.5,
      };
      
      res.json({
        ...result,
        tokenData: mockData
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error launching token:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  } finally {
    // Clean up temp upload file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// Buy token
app.post('/api/token/buy', async (req, res) => {
  try {
    const { tokenAddress, solAmount } = req.body;
    
    if (!tokenAddress || !solAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenAddress and solAmount are required'
      });
    }
    
    const result = await tokenLauncherService.buyToken({
      tokenAddress,
      solAmount: parseFloat(solAmount),
      retry: true
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error buying token:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// Sell token
app.post('/api/token/sell', async (req, res) => {
  try {
    const { tokenAddress, percentage } = req.body;
    
    if (!tokenAddress || percentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenAddress and percentage are required'
      });
    }
    
    const result = await tokenLauncherService.sellToken({
      tokenAddress,
      percentage: parseInt(percentage),
      retry: true
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error selling token:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// List tokens
app.get('/api/token/list', async (req, res) => {
  try {
    const result = await tokenLauncherService.listTokens();
    
    if (result.success && result.tokens && result.tokens.length > 0) {
      res.json(result);
    } else {
      // For development, return mock data
      const mockTokens = [
        {
          address: "SIMULATED_ADDRESS_123456",
          name: "Mock Token",
          symbol: "MOCK",
          balance: 100000,
          price: 0.0000143,
          value: 1.43,
          launchDate: new Date().toISOString()
        },
        {
          address: "SIMULATED_ADDRESS_789012",
          name: "Sample Token",
          symbol: "SAMP",
          balance: 250000,
          price: 0.0000078,
          value: 1.95,
          launchDate: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      res.json({
        success: true,
        message: result.error || 'No tokens found, using mock data for development',
        tokens: mockTokens
      });
    }
  } catch (error) {
    console.error('Error listing tokens:', error);
    
    // For development, return mock data
    const mockTokens = [
      {
        address: "SIMULATED_ADDRESS_123456",
        name: "Mock Token",
        symbol: "MOCK",
        balance: 100000,
        price: 0.0000143,
        value: 1.43,
        launchDate: new Date().toISOString()
      },
      {
        address: "SIMULATED_ADDRESS_789012",
        name: "Sample Token",
        symbol: "SAMP",
        balance: 250000,
        price: 0.0000078,
        value: 1.95,
        launchDate: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      message: 'Error occurred, using mock data for development',
      tokens: mockTokens
    });
  }
});

// Get trending tokens
app.get('/api/token/trending', async (req, res) => {
  try {
    const { limit = 10, timeframe = '24h' } = req.query;
    
    // Try to fetch from Solana Tracker API
    try {
      const response = await axios.get(`${SOLANA_TRACKER_BASE_URL}/tokens/trending`, {
        params: { limit, timeframe },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SOLANA_TRACKER_API_KEY
        }
      });
      
      if (response.data && response.data.tokens) {
        return res.json({
          success: true,
          tokens: response.data.tokens,
          message: 'Trending tokens fetched successfully'
        });
      }
    } catch (apiError) {
      console.error('Error fetching from Solana Tracker API:', apiError);
      // Continue to mock data if API call fails
    }
    
    // Return mock data for development or if API call fails
    const mockTrendingTokens = [
      {
        address: "SOL123456789",
        name: "Bonk",
        symbol: "BONK",
        price: 0.00002143,
        priceChange24h: 12.5,
        volume24h: 8500000,
        marketCap: 25000000
      },
      {
        address: "SOL987654321",
        name: "Dogwifhat",
        symbol: "WIF",
        price: 0.000547,
        priceChange24h: 5.2,
        volume24h: 5200000,
        marketCap: 18000000
      },
      {
        address: "SOL123123123",
        name: "Meme Coin",
        symbol: "MEME",
        price: 0.00000985,
        priceChange24h: -3.7,
        volume24h: 3100000,
        marketCap: 12000000
      },
      {
        address: "SOL456456456",
        name: "Jupiter",
        symbol: "JUP",
        price: 0.00078,
        priceChange24h: 8.1,
        volume24h: 9800000,
        marketCap: 32000000
      },
      {
        address: "SOL789789789",
        name: "Pyth Network",
        symbol: "PYTH",
        price: 0.0025,
        priceChange24h: 1.2,
        volume24h: 4500000,
        marketCap: 28000000
      },
      {
        address: "SOL135792468",
        name: "Raydium",
        symbol: "RAY",
        price: 0.0015,
        priceChange24h: -2.3,
        volume24h: 3800000,
        marketCap: 21000000
      },
      {
        address: "SOL246813579",
        name: "Orca",
        symbol: "ORCA",
        price: 0.0035,
        priceChange24h: 4.8,
        volume24h: 5500000,
        marketCap: 19000000
      },
      {
        address: "SOL975318642",
        name: "Samoyedcoin",
        symbol: "SAMO",
        price: 0.000078,
        priceChange24h: 9.5,
        volume24h: 2700000,
        marketCap: 11000000
      },
      {
        address: "SOL864209753",
        name: "Marinade",
        symbol: "MNDE",
        price: 0.00056,
        priceChange24h: 3.2,
        volume24h: 1900000,
        marketCap: 9500000
      },
      {
        address: "SOL753197532",
        name: "Render",
        symbol: "RNDR",
        price: 0.0042,
        priceChange24h: -1.8,
        volume24h: 6300000,
        marketCap: 14000000
      }
    ];
    
    res.json({
      success: true,
      message: 'Using mock trending tokens data for development',
      tokens: mockTrendingTokens
    });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      tokens: []
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Token API server running on port ${PORT}`);
});

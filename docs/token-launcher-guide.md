# Solana Token Launcher Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage Guide](#usage-guide)
   - [Wallet Setup](#wallet-setup)
   - [Launching Tokens](#launching-tokens)
   - [Trading Tokens](#trading-tokens)
   - [Visualizing Tokens](#visualizing-tokens)
   - [Exploring Trending Tokens](#exploring-trending-tokens)
6. [API Reference](#api-reference)
7. [Integrating with LLM Agents](#integrating-with-llm-agents)
8. [Advanced Customization](#advanced-customization)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

## Introduction

The Solana Token Launcher is a comprehensive toolkit that enables seamless creation, management, and trading of tokens on the Solana blockchain. This integration connects the Eliza framework with PumpFun's Raydium CLI tools, providing a user-friendly interface for token operations while leveraging the power and efficiency of the Solana ecosystem.

### Key Features

- **Token Creation**: Launch custom tokens with personalized metadata and images
- **Token Trading**: Buy and sell tokens with real-time price data
- **Token Visualization**: View detailed token metrics and activity
- **Trending Analysis**: Discover popular tokens in the ecosystem
- **Agent Integration**: Connect token operations with AI agents

### Target Audience

- Developers building on Solana
- Traders and token creators
- DeFi project teams
- Eliza framework users

## Architecture Overview

The Solana Token Launcher is built on a modular architecture that connects several components:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Eliza Client   │<─────│  Token API      │<─────│  PumpFun        │
│  (React UI)     │      │  (Express)      │      │  (Raydium CLI)  │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Core Components

1. **Frontend (React UI)**
   - Token launcher interface
   - Token listing and visualization
   - Trading components
   - Trending token displays

2. **API Layer (Express)**
   - RESTful API endpoints
   - Token operation handlers
   - Wallet management
   - Error handling and responses

3. **Backend Services**
   - Token Launcher Service
   - Agent Integration
   - Wallet Management
   - Token Storage and Configuration

4. **PumpFun Integration**
   - Connection to Raydium CLI tools
   - Solana transaction processing
   - Blockchain interactions

## Installation

### Prerequisites

- Node.js (v16+)
- NPM or Yarn
- Git
- Solana CLI (optional but recommended)

### Setup Instructions

1. **Clone the Repositories**

```bash
# Clone the Eliza repository
git clone https://github.com/your-org/eliza.git
cd eliza

# Clone the PumpFun Raydium CLI tools
git clone https://github.com/your-org/pumpfun-raydium-cli-tools.git
```

2. **Install Dependencies**

```bash
# Install main project dependencies
npm install

# Install server dependencies
cd server
npm install express cors multer uuid axios
cd ..

# Install plugin dependencies
cd plugins/pumpfun-plugin
npm install
npm install uuid
cd ../..
```

3. **Build the Project**

```bash
# Build the token launcher plugin
cd plugins/pumpfun-plugin
npm run build
cd ../..
```

4. **Make the Startup Script Executable**

```bash
chmod +x start-token-launcher.sh
```

## Configuration

### Directory Structure

The token launcher uses a specific directory structure for storing configuration and data:

```
~/.config/eliza/pumpfun/
  ├── wallets/     # Stores wallet keypairs
  ├── images/      # Stores token images
  ├── tokens/      # Stores token metadata
  └── config.json  # Configuration settings
```

### Configuration Settings

The main configuration file is located at `~/.config/eliza/pumpfun/config.json` and contains:

- RPC endpoint configuration
- Active wallet settings
- Registered wallets information

Example configuration:

```json
{
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "activeWallet": "my-wallet",
  "wallets": [
    {
      "name": "my-wallet",
      "path": "/path/to/wallet.json"
    }
  ]
}
```

## Usage Guide

### Getting Started

1. Start the token launcher with the provided script:

```bash
./start-token-launcher.sh
```

2. Access the token launcher interface at:
   http://localhost:3000/token-launcher

3. The interface will display tabs for different token operations

### Wallet Setup

Before launching or trading tokens, you need to set up a wallet:

1. Navigate to the **Trade** tab
2. If no wallet is configured, you'll see an option to set up a wallet
3. Click "Setup Wallet" and provide a name (optional)
4. The system will either:
   - Use a wallet from PumpFun if available
   - Create a new wallet keypair
5. The wallet address and SOL balance will be displayed

### Launching Tokens

To create a new token:

1. Navigate to the **Launch Token** tab
2. Fill in the token details:
   - **Name**: Full name of your token
   - **Symbol**: Short identifier (uppercase)
   - **Description**: Information about your token
   - **Initial Buy Amount**: How much SOL to invest initially
   - **Token Image**: Upload an image for your token
3. Optional: Add social links (Telegram, Twitter, Website)
4. Click "Launch Token"
5. Once successful, you'll be redirected to visualize your new token

### Trading Tokens

To buy or sell tokens:

1. Navigate to the **Trade Tokens** tab
2. Select a token from the dropdown
3. For buying:
   - Select the "Buy" tab
   - Enter SOL amount to spend
   - Click "Buy [Symbol]"
4. For selling:
   - Select the "Sell" tab
   - Use the slider to choose percentage to sell
   - Click "Sell [Percentage]% of [Symbol]"
5. Transaction will be processed and token balances updated

### Visualizing Tokens

To view detailed token information:

1. Select a token from the **My Tokens** tab or after launching
2. The **Visualize Token** tab will display:
   - Overview metrics (price, market cap, volume)
   - Price charts and history
   - Transaction activity
   - Token details and social links

### Exploring Trending Tokens

To discover popular tokens:

1. Navigate to the **Trending** tab
2. View tokens sorted by trading activity
3. See metrics like:
   - Current price
   - 24h price change
   - Trading volume
   - Market capitalization
4. Click "View" on a trending token to see its details

## API Reference

The Token Launcher exposes a RESTful API for integration with other systems.

### Wallet Endpoints

#### `POST /api/token/setup-wallet`
Sets up a new wallet or configures an existing one

Request body:
```json
{
  "walletName": "optional-wallet-name"
}
```

Response:
```json
{
  "success": true,
  "address": "wallet-address",
  "balance": 10.5,
  "name": "wallet-name"
}
```

#### `GET /api/token/wallet`
Retrieves current wallet information

Response:
```json
{
  "success": true,
  "address": "wallet-address",
  "balance": 10.5,
  "name": "wallet-name"
}
```

### Token Endpoints

#### `POST /api/token/launch`
Launches a new token

Request: `multipart/form-data` with fields:
- `name`: Token name
- `symbol`: Token symbol
- `description`: Token description
- `initialBuyAmount`: Initial SOL investment
- `image`: Token image file
- `telegram` (optional): Telegram link
- `twitter` (optional): Twitter link
- `website` (optional): Website link

Response:
```json
{
  "success": true,
  "tokenAddress": "token-address",
  "imageUrl": "/api/token/image/token-image.png",
  "tokenData": {
    // Token visualization data
  }
}
```

#### `POST /api/token/buy`
Buys a token

Request body:
```json
{
  "tokenAddress": "token-address",
  "solAmount": 0.5
}
```

Response:
```json
{
  "success": true,
  "tokenAddress": "token-address",
  "tokenBalance": 100000,
  "txId": "transaction-id"
}
```

#### `POST /api/token/sell`
Sells a token

Request body:
```json
{
  "tokenAddress": "token-address",
  "percentage": 50
}
```

Response:
```json
{
  "success": true,
  "tokenAddress": "token-address",
  "tokenBalance": 50000,
  "txId": "transaction-id"
}
```

#### `GET /api/token/list`
Lists all tokens launched by the wallet

Response:
```json
{
  "success": true,
  "tokens": [
    {
      "address": "token-address",
      "name": "Token Name",
      "symbol": "TKN",
      "balance": 100000,
      "price": 0.0000143,
      "value": 1.43,
      "launchDate": "2025-03-23T21:16:53.000Z"
    }
  ]
}
```

#### `GET /api/token/trending`
Gets trending tokens

Query parameters:
- `limit`: Number of tokens to return (default: 10)
- `timeframe`: Time period to analyze (default: "24h")

Response:
```json
{
  "success": true,
  "tokens": [
    {
      "address": "token-address",
      "name": "Token Name",
      "symbol": "TKN",
      "price": 0.00002143,
      "priceChange24h": 12.5,
      "volume24h": 8500000,
      "marketCap": 25000000
    }
  ]
}
```

## Integrating with LLM Agents

The Token Launcher can be integrated with AI agents to automate token operations.

### Agent Integration Interface

The `PumpFunAgentIntegration` class provides methods for agents to interact with tokens:

```typescript
const agent = new PumpFunAgentIntegration(walletPath, rpcUrl, outputDir);

// Launch a token
const launchResult = await agent.launchToken(
  "Token Name", 
  "TKN",
  "Token description", 
  0.5, 
  "path/to/image.png"
);

// Buy tokens
const buyResult = await agent.buyToken("tokenAddress", 0.5);

// Sell tokens
const sellResult = await agent.sellToken("tokenAddress", 50);

// List tokens
const tokens = await agent.listTokens();
```

### Example: Token Launch Agent

Here's a simple example of an agent that can launch tokens:

```typescript
import { tokenLauncherService } from "./token-launcher-service";

async function createTokenWithAgent(prompt: string) {
  // Generate token details based on prompt
  const tokenDetails = await generateTokenDetails(prompt);
  
  // Generate token image
  const tokenImage = await generateTokenImage(tokenDetails.description);
  
  // Launch the token
  return await tokenLauncherService.launchToken({
    name: tokenDetails.name,
    symbol: tokenDetails.symbol,
    description: tokenDetails.description,
    initialBuyAmount: 0.5,
    image: tokenImage,
    retry: true
  });
}
```

## Advanced Customization

### Test Mode

The token launcher includes a test mode that allows you to:
- Test UI components without making real blockchain transactions
- Simulate different API responses (success, error, empty)
- Develop and debug without spending real SOL

To enable test mode:

```typescript
import { useTestMode } from '@/contexts/test-mode-context';

function MyComponent() {
  const { testMode, toggleTestMode, setTestModeType } = useTestMode();
  
  // Enable test mode
  toggleTestMode();
  
  // Set test mode type
  setTestModeType('success'); // or 'error', 'empty'
}
```

### Custom Token Images

You can customize how token images are generated and stored:

1. Modify the image storage location:
   - Edit `tokenLauncherService.ts` to change `IMAGES_DIR`

2. Implement custom image generation:
   - Connect to an AI image generation service
   - Create a service that converts text to images

### Custom API Integration

To integrate with external price APIs:

1. Add a new endpoint in `token-api.js`:
   ```javascript
   app.get('/api/token/price/:tokenAddress', async (req, res) => {
     // Implement external API call
   });
   ```

2. Add corresponding method in `token-service.ts`:
   ```typescript
   export const getTokenPrice = async (tokenAddress: string) => {
     // Implement API call
   };
   ```

## Troubleshooting

### Common Issues

#### Token Launch Fails

**Symptoms**: Token launch returns an error or times out

**Possible Solutions**:
- Check wallet SOL balance
- Verify RPC endpoint is accessible
- Ensure image file size is under 5MB
- Check for network issues

#### API Connection Errors

**Symptoms**: Frontend cannot connect to API server

**Possible Solutions**:
- Make sure token API server is running (`node token-api.js`)
- Check port 3001 is not blocked by firewall
- Verify correct API URL in frontend settings

#### Wallet Setup Issues

**Symptoms**: Cannot setup wallet or wallet shows 0 balance

**Possible Solutions**:
- Check PumpFun wallet directory exists
- Verify wallet file permissions
- Try creating a new wallet

### Logs and Debugging

The token launcher logs information in several locations:

1. **Server logs**: Output from the Express server
2. **Frontend console**: Browser developer tools
3. **Configuration directory**: `~/.config/eliza/pumpfun/`

To enable verbose logging, add to `server/token-api.js`:

```javascript
const DEBUG = true;

function logDebug(message) {
  if (DEBUG) console.log(`[DEBUG] ${message}`);
}
```

## FAQ

**Q: Do I need a Solana wallet to use the token launcher?**

A: Yes, but the system can create one for you if you don't have one.

**Q: Are the tokens launched on Solana mainnet?**

A: By default, tokens are launched on the Solana mainnet. You can configure the RPC URL to use devnet or testnet instead.

**Q: How much SOL do I need to launch a token?**

A: The minimum is 0.01 SOL, but we recommend at least 0.5 SOL for better initial liquidity.

**Q: Can I import existing tokens?**

A: Yes, you can view any existing token by entering its address in the search feature.

**Q: How are token images stored?**

A: Token images are stored locally in the `~/.config/eliza/pumpfun/images/` directory and served via the API.

**Q: Can I customize the token metadata after launch?**

A: Some metadata (like social links) can be updated, but core properties like name and symbol are immutable after launch.

**Q: Is the token launcher compatible with mobile devices?**

A: The web interface is responsive and works on mobile browsers, but the server components need to run on a desktop/server.

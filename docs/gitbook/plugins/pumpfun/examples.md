# Examples

This section contains practical examples that demonstrate how to use the PumpFun Plugin in various scenarios. These examples will help you understand how to implement and customize the plugin for your specific needs.

## Basic Token Launch Example

This example demonstrates how to create a simple script that launches a new token on PumpFun:

```typescript
// launch-token.ts
import { PumpFunPlugin } from '@elizaos/pumpfun-plugin';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const WALLET_PATH = '/path/to/wallet.json';
const RPC_URL = 'https://api.devnet.solana.com';
const CONFIG_DIR = './token-configs';

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

async function launchToken() {
  // Initialize plugin
  const pumpfun = new PumpFunPlugin(WALLET_PATH, RPC_URL, CONFIG_DIR);
  
  // Get wallet info
  const walletInfo = await pumpfun.getWalletInfo();
  console.log(`Using wallet: ${walletInfo.address}`);
  console.log(`SOL Balance: ${walletInfo.balance} SOL`);
  
  // Token details
  const tokenName = 'Example Token';
  const tokenSymbol = 'EXMPL';
  const tokenDescription = 'This is an example token for demonstration purposes';
  const initialBuyAmount = 0.1; // SOL
  const imagePath = './token-image.png';
  const socialLinks = {
    telegram: '@exampletoken',
    twitter: '@exampletoken',
    website: 'https://example.com'
  };
  
  // Launch token
  console.log('Launching token...');
  try {
    const result = await pumpfun.launchToken(
      tokenName,
      tokenSymbol,
      tokenDescription,
      initialBuyAmount,
      imagePath,
      socialLinks
    );
    
    if (result.success) {
      console.log('Token launched successfully!');
      console.log(`Token Address: ${result.tokenAddress}`);
      console.log(`Initial Balance: ${result.tokenBalance}`);
      console.log(`PumpFun URL: ${result.pumpfunUrl}`);
      console.log(`Keypair saved to: ${result.keypairPath}`);
    } else {
      console.error(`Failed to launch token: ${result.error}`);
    }
  } catch (error) {
    console.error('Error launching token:', error);
  }
}

// Run the function
launchToken().catch(console.error);
```

## Trading Bot Example

This example shows how to create a simple trading bot that monitors and trades tokens on PumpFun:

```typescript
// trading-bot.ts
import { PumpFunPlugin } from '@elizaos/pumpfun-plugin';

// Configuration
const WALLET_PATH = '/path/to/wallet.json';
const RPC_URL = 'https://api.mainnet-beta.solana.com'; // Using mainnet
const CONFIG_DIR = './trading-bot-configs';

// Token addresses to monitor
const TOKENS_TO_MONITOR = [
  'TokenAddress1',
  'TokenAddress2',
  'TokenAddress3'
];

// Bot settings
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BUY_THRESHOLD = 0.05; // 5% price drop
const SELL_THRESHOLD = 0.1; // 10% price increase
const MAX_SOL_PER_TRADE = 0.2;

async function startTradingBot() {
  // Initialize plugin
  const pumpfun = new PumpFunPlugin(WALLET_PATH, RPC_URL, CONFIG_DIR);
  
  // Get wallet info
  const walletInfo = await pumpfun.getWalletInfo();
  console.log(`Trading bot started with wallet: ${walletInfo.address}`);
  console.log(`SOL Balance: ${walletInfo.balance} SOL`);
  
  // Track token prices
  const tokenPrices = new Map<string, number>();
  
  // Initialize token prices
  for (const tokenAddress of TOKENS_TO_MONITOR) {
    const tokenInfo = await pumpfun.getTokenBalance(tokenAddress);
    if (tokenInfo.success) {
      console.log(`Monitoring token: ${tokenAddress}`);
      // In a real bot, you would also track price information
      tokenPrices.set(tokenAddress, 0); // Placeholder for current price
    } else {
      console.warn(`Failed to get information for token: ${tokenAddress}`);
    }
  }
  
  // Start monitoring loop
  setInterval(async () => {
    for (const tokenAddress of TOKENS_TO_MONITOR) {
      try {
        // In a real trading bot, you would fetch current price and analyze trends
        const currentPrice = 0; // Placeholder for actual price fetching
        const previousPrice = tokenPrices.get(tokenAddress) || 0;
        
        // Update stored price
        tokenPrices.set(tokenAddress, currentPrice);
        
        // Calculate price change
        const priceChange = (currentPrice - previousPrice) / previousPrice;
        
        // Execute trading strategy
        if (priceChange <= -BUY_THRESHOLD) {
          // Price dropped by threshold, consider buying
          console.log(`Price drop detected for ${tokenAddress}: ${priceChange * 100}%`);
          const buyResult = await pumpfun.buyToken(tokenAddress, MAX_SOL_PER_TRADE);
          if (buyResult.success) {
            console.log(`Successfully bought tokens: ${buyResult.tokenBalance}`);
          }
        } else if (priceChange >= SELL_THRESHOLD) {
          // Price increased by threshold, consider selling
          console.log(`Price increase detected for ${tokenAddress}: ${priceChange * 100}%`);
          // Sell 50% of tokens
          const sellResult = await pumpfun.sellToken(tokenAddress, 0.5);
          if (sellResult.success) {
            console.log(`Successfully sold tokens. New balance: ${sellResult.tokenBalance}`);
          }
        }
      } catch (error) {
        console.error(`Error processing token ${tokenAddress}:`, error);
      }
    }
  }, CHECK_INTERVAL);
}

// Run the bot
startTradingBot().catch(console.error);
```

## Agent Integration Example

This example demonstrates how to integrate the PumpFun Plugin with an Eliza agent:

```typescript
// agent-integration.ts
import { AgentSession } from '@elizaos/agent';
import { PumpFunAgentIntegration } from '@elizaos/pumpfun-plugin';

// Initialize PumpFun agent integration
const pumpfunAgent = new PumpFunAgentIntegration(
  '/path/to/wallet.json',
  'https://api.devnet.solana.com',
  './token-configs'
);

// Agent message handler
async function handleAgentMessage(session: AgentSession, message: string) {
  // Extract intent and entities from the message
  // In a real agent, you would use NLP/NLU for this
  const intent = extractIntent(message);
  const entities = extractEntities(message);
  
  // Handle PumpFun related intents
  if (intent.includes('pumpfun') || intent.includes('token')) {
    if (intent.includes('launch')) {
      // Handle token launch intent
      return handleTokenLaunch(session, entities);
    } else if (intent.includes('buy')) {
      // Handle token buy intent
      return handleTokenBuy(session, entities);
    } else if (intent.includes('sell')) {
      // Handle token sell intent
      return handleTokenSell(session, entities);
    } else if (intent.includes('list') || intent.includes('show')) {
      // Handle list tokens intent
      const tokenList = await pumpfunAgent.listTokens();
      return session.send(tokenList);
    } else if (intent.includes('wallet') || intent.includes('balance')) {
      // Handle wallet info intent
      const walletInfo = await pumpfunAgent.getWalletInfo();
      return session.send(walletInfo);
    }
  }
  
  // If not a PumpFun intent, pass to other handlers
  return handleOtherIntents(session, message);
}

// Token launch handler
async function handleTokenLaunch(session: AgentSession, entities: any) {
  // Check if we have all required entities
  if (!entities.name) {
    return session.send('What would you like to name your token?');
  }
  if (!entities.symbol) {
    return session.send('What symbol would you like to use for your token?');
  }
  if (!entities.description) {
    return session.send('Please provide a description for your token.');
  }
  if (!entities.initialBuy) {
    return session.send('How much SOL would you like to use for the initial buy?');
  }
  if (!entities.imagePath) {
    return session.send('Please provide an image for your token.');
  }
  
  // Launch the token
  const result = await pumpfunAgent.launchToken(
    entities.name,
    entities.symbol,
    entities.description,
    entities.initialBuy,
    entities.imagePath,
    entities.telegram,
    entities.twitter,
    entities.website
  );
  
  return session.send(result);
}

// Token buy handler
async function handleTokenBuy(session: AgentSession, entities: any) {
  // ... similar implementation
}

// Token sell handler
async function handleTokenSell(session: AgentSession, entities: any) {
  // ... similar implementation
}

// Helper function for intent extraction (simplified)
function extractIntent(message: string): string[] {
  return message.toLowerCase().split(' ');
}

// Helper function for entity extraction (simplified)
function extractEntities(message: string): any {
  // In a real agent, you would use NLP/NLU for this
  return {};
}

// Other intent handler
function handleOtherIntents(session: AgentSession, message: string) {
  // Handle other intents
  return session.send('I don\'t understand that command. Try asking about tokens or PumpFun.');
}
```

## Voice Assistant Example

This example shows how to use the Voice Assistant Service to create a voice-controlled token management interface:

```typescript
// voice-assistant.ts
import { PumpFunAgentIntegration } from '@elizaos/pumpfun-plugin';
import { VoiceAssistantService } from '@elizaos/pumpfun-plugin';

// Initialize agent integration
const pumpfunAgent = new PumpFunAgentIntegration(
  '/path/to/wallet.json',
  'https://api.devnet.solana.com',
  './token-configs'
);

// Initialize voice assistant
const voiceAssistant = new VoiceAssistantService(pumpfunAgent);

// Function to handle voice input
async function handleVoiceInput(transcription: string) {
  console.log(`Processing voice command: "${transcription}"`);
  
  // Process the command
  try {
    const response = await voiceAssistant.processCommand(transcription);
    console.log('Assistant response:', response);
    
    // In a real app, you would send this to a text-to-speech service
    speakResponse(response);
  } catch (error) {
    console.error('Error processing voice command:', error);
    speakResponse('Sorry, I encountered an error processing your request.');
  }
}

// Simulated text-to-speech function
function speakResponse(text: string) {
  console.log(`[SPEAKING] ${text}`);
  // In a real app, you would connect to a text-to-speech service here
}

// Example voice commands to process
const exampleCommands = [
  'Launch a new token called Galactic Coin with the symbol GLXY',
  'Buy 0.5 SOL worth of tokens at address FzLdFu9MU2ycxdB3uW7qYJKU8Esk5ShLu9H4EUJ5noZR',
  'Sell 50 percent of my MOON tokens',
  'Show me my wallet balance',
  'List all my tokens'
];

// Process example commands
async function processExamples() {
  for (const command of exampleCommands) {
    console.log('\n-----------------------------------');
    await handleVoiceInput(command);
    // Wait 2 seconds between commands for demonstration
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Run the examples
processExamples().catch(console.error);
```

## Advanced Configuration Example

This example demonstrates advanced configuration and customization of the PumpFun Plugin:

```typescript
// advanced-config.ts
import { PumpFunPlugin } from '@elizaos/pumpfun-plugin';
import * as fs from 'fs';
import * as path from 'path';

// Custom configuration
interface PumpFunConfig {
  walletPath: string;
  rpcUrl: string;
  configDir: string;
  defaultInitialBuy: number;
  maxSolPerTransaction: number;
  defaultTokenDescription: string;
  enableAutomaticSelling: boolean;
  autoSellThreshold: number;
  defaultSocialLinks: {
    telegram?: string;
    twitter?: string;
    website?: string;
  };
}

// Load configuration from file
function loadConfig(configPath: string): PumpFunConfig {
  if (!fs.existsSync(configPath)) {
    // Create default config if it doesn't exist
    const defaultConfig: PumpFunConfig = {
      walletPath: './wallet.json',
      rpcUrl: 'https://api.devnet.solana.com',
      configDir: './token-configs',
      defaultInitialBuy: 0.1,
      maxSolPerTransaction: 1.0,
      defaultTokenDescription: 'Created with PumpFun Plugin',
      enableAutomaticSelling: false,
      autoSellThreshold: 0.2, // 20% increase
      defaultSocialLinks: {}
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  
  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData) as PumpFunConfig;
  } catch (error) {
    console.error('Error loading config:', error);
    throw new Error('Failed to load configuration');
  }
}

// Create a configured plugin instance
function createConfiguredPlugin(config: PumpFunConfig): PumpFunPlugin {
  // Ensure config directory exists
  if (!fs.existsSync(config.configDir)) {
    fs.mkdirSync(config.configDir, { recursive: true });
  }
  
  return new PumpFunPlugin(
    config.walletPath,
    config.rpcUrl,
    config.configDir
  );
}

// Token launching with configuration defaults
async function launchTokenWithDefaults(
  plugin: PumpFunPlugin,
  config: PumpFunConfig,
  name: string,
  symbol: string,
  imagePath: string,
  description?: string,
  initialBuyAmount?: number,
  socialLinks?: any
) {
  // Apply defaults where values aren't provided
  const tokenDescription = description || config.defaultTokenDescription;
  const buySolAmount = Math.min(
    initialBuyAmount || config.defaultInitialBuy,
    config.maxSolPerTransaction
  );
  const tokenSocialLinks = {
    ...config.defaultSocialLinks,
    ...(socialLinks || {})
  };
  
  // Launch the token
  return plugin.launchToken(
    name,
    symbol,
    tokenDescription,
    buySolAmount,
    imagePath,
    tokenSocialLinks
  );
}

// Main function
async function main() {
  // Load configuration
  const config = loadConfig('./pumpfun-config.json');
  console.log('Configuration loaded');
  
  // Create configured plugin
  const plugin = createConfiguredPlugin(config);
  
  // Example: Launch a token with defaults
  const result = await launchTokenWithDefaults(
    plugin,
    config,
    'Configured Token',
    'CONF',
    './token-image.png'
  );
  
  if (result.success) {
    console.log('Token launched successfully!');
    console.log(`Token Address: ${result.tokenAddress}`);
    
    // Implement automatic selling if enabled
    if (config.enableAutomaticSelling) {
      // In a real app, you would monitor the token price
      // and sell when it reaches the threshold
      console.log('Automatic selling enabled, monitoring price...');
    }
  } else {
    console.error(`Failed to launch token: ${result.error}`);
  }
}

// Run the example
main().catch(console.error);
```

## Next Steps

These examples provide a starting point for implementing the PumpFun Plugin in your projects. You can customize and extend these examples to fit your specific needs. For more detailed information about the available methods and options, refer to the [API Reference](./api-reference.md) section.

# Agent Integration

The PumpFun Plugin is designed to work seamlessly with Eliza agents. This guide explains how to integrate the plugin with your agent and provides examples of agent-driven workflows.

## Overview

The `PumpFunAgentIntegration` class provides a higher-level, more conversational interface specifically tailored for AI agent interactions. It wraps the core functionality of the PumpFun Plugin in methods that return human-readable text responses, making it ideal for integration with conversational AI agents.

## Key Features

- **Natural Language Responses**: All methods return human-readable text strings
- **Token Management**: Launch, buy, and sell tokens using agent commands
- **Portfolio Management**: Track and manage multiple tokens
- **Configuration Storage**: Automatically saves token configurations for future reference

## Integration Steps

### 1. Import the Agent Integration

In your agent code, import the `PumpFunAgentIntegration` class:

```typescript
import { PumpFunAgentIntegration } from '@elizaos/pumpfun-plugin';
```

### 2. Initialize the Integration

Create a new instance with your wallet path, RPC URL, and configuration directory:

```typescript
const pumpfunAgent = new PumpFunAgentIntegration(
  '/path/to/wallet.json',
  'https://api.devnet.solana.com',
  './token-configs'
);
```

### 3. Add Commands to Your Agent

Implement commands in your agent that map to the PumpFun integration methods:

```typescript
// Example agent command handler
async function handlePumpFunCommand(command, args) {
  switch (command) {
    case 'wallet':
      return await pumpfunAgent.getWalletInfo();
    
    case 'launch':
      return await pumpfunAgent.launchToken(
        args.name,
        args.symbol,
        args.description,
        args.initialBuy,
        args.imagePath,
        args.telegram,
        args.twitter,
        args.website
      );
    
    case 'buy':
      return await pumpfunAgent.buyToken(args.tokenAddress, args.solAmount);
    
    case 'sell':
      return await pumpfunAgent.sellToken(args.tokenAddress, args.percentage);
    
    case 'balance':
      return await pumpfunAgent.getTokenBalance(args.tokenAddress);
    
    case 'list':
      return await pumpfunAgent.listTokens();
    
    default:
      return `Unknown PumpFun command: ${command}`;
  }
}
```

## Agent Command Examples

### Checking Wallet Status

```
Agent: I'd like to check my wallet status.
System: Processing wallet information request...
Agent: Your wallet address is FzLdFu9MU2ycxdB3uW7qYJKU8Esk5ShLu9H4EUJ5noZR
       SOL Balance: 4.8923 SOL
```

### Launching a Token

```
Agent: I want to launch a new token called "Moon Coin" with the symbol "MOON".
System: Processing token launch request...
Agent: Please provide a description for your token.
User: A token that will go to the moon!
Agent: What amount of SOL would you like to use for the initial buy?
User: 0.2 SOL
Agent: Please provide an image for your token.
User: [Uploads moon.png]
Agent: Successfully launched token!
       Token Name: Moon Coin
       Token Symbol: MOON
       Token Address: 7XYZuvVL9FLr89NM7wkuszPUiUWMxVkbjC6XiWKYusM2
       Initial Balance: 4200
       PumpFun URL: https://pump.fun/7XYZuvVL9FLr89NM7wkuszPUiUWMxVkbjC6XiWKYusM2
       Token info saved to: /token-configs/moon_info.json
```

### Buying Tokens

```
Agent: I want to buy some DOGE tokens.
System: Processing token buy request...
Agent: How much SOL would you like to spend?
User: 0.5 SOL
Agent: Please provide the token address.
User: D0G3SoLaNaT0k3nAddR3sS123456789abcdefghijklmnopq
Agent: Successfully bought tokens!
       Token Address: D0G3SoLaNaT0k3nAddR3sS123456789abcdefghijklmnopq
       Amount Spent: 0.5 SOL
       New Token Balance: 12500
       PumpFun URL: https://pump.fun/D0G3SoLaNaT0k3nAddR3sS123456789abcdefghijklmnopq
```

### Selling Tokens

```
Agent: I want to sell some of my MOON tokens.
System: Processing token sell request...
Agent: What percentage of your tokens would you like to sell?
User: 50%
Agent: Successfully sold tokens!
       Token Address: 7XYZuvVL9FLr89NM7wkuszPUiUWMxVkbjC6XiWKYusM2
       Percentage Sold: 50%
       Remaining Token Balance: 2100
       PumpFun URL: https://pump.fun/7XYZuvVL9FLr89NM7wkuszPUiUWMxVkbjC6XiWKYusM2
```

### Listing Tokens

```
Agent: Show me all my tokens.
System: Processing token list request...
Agent: Tokens launched by this wallet:

       Name: Moon Coin
       Symbol: MOON
       Address: 7XYZuvVL9FLr89NM7wkuszPUiUWMxVkbjC6XiWKYusM2
       Launch Date: 3/24/2023, 12:30:45 PM
       PumpFun URL: https://pump.fun/7XYZuvVL9FLr89NM7wkuszPUiUWMxVkbjC6XiWKYusM2

       Name: Star Token
       Symbol: STAR
       Address: St4Rt0k3nAddR3sS123456789abcdefghijklmnopq
       Launch Date: 3/25/2023, 3:15:20 PM
       PumpFun URL: https://pump.fun/St4Rt0k3nAddR3sS123456789abcdefghijklmnopq
```

## Voice Assistant Integration

The PumpFun Plugin also includes a Voice Assistant Service that can parse natural language commands for token operations. This allows for even more conversational interactions:

```typescript
import { VoiceAssistantService } from '@elizaos/pumpfun-plugin';

const voiceAssistant = new VoiceAssistantService(pumpfunAgent);

// Process a voice command
const result = await voiceAssistant.processCommand(
  "Launch a token called Rocket Coin with symbol RKT and description 'To the stars!'"
);
console.log(result);
```

## Error Handling

The agent integration provides human-readable error messages that can be directly presented to users:

```
Agent: I want to sell some FAKE tokens.
System: Processing token sell request...
Agent: Error selling tokens: Token not found. Please check the token address and try again.
```

## Next Steps

For more examples of how to use the PumpFun Plugin with agents, check out the [Examples](./examples.md) section.

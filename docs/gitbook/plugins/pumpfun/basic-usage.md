# Basic Usage

This guide covers the fundamental operations of the PumpFun Plugin, demonstrating how to launch tokens and execute trades.

## Importing the Plugin

You can import and use the PumpFun Plugin in your JavaScript or TypeScript code:

```typescript
import { PumpFunPlugin } from '@elizaos/pumpfun-plugin';

// Initialize the plugin with wallet path, RPC URL, and token directory
const pumpfun = new PumpFunPlugin(
  '/path/to/wallet.json',
  'https://api.devnet.solana.com',
  './token-configs'
);
```

## Launching a New Token

To create and launch a new token on PumpFun:

```typescript
const result = await pumpfun.launchToken(
  'My Awesome Token',         // Token name
  'AWESOME',                  // Token symbol
  'The most awesome token',   // Token description
  0.1,                        // Initial buy amount in SOL
  './path/to/image.png',      // Token image path
  {
    telegram: '@myawesometoken', // Optional social links
    twitter: '@myawesometoken',
    website: 'https://myawesometoken.com'
  }
);

if (result.success) {
  console.log(`Token created successfully at ${result.tokenAddress}`);
  console.log(`Initial balance: ${result.tokenBalance}`);
  console.log(`View on PumpFun: ${result.pumpfunUrl}`);
} else {
  console.error(`Failed to create token: ${result.error}`);
}
```

## Buying Tokens

To purchase existing tokens on PumpFun:

```typescript
const buyResult = await pumpfun.buyToken(
  'TokenAddressHere',  // Token mint address
  0.5                  // Amount of SOL to spend
);

if (buyResult.success) {
  console.log(`Successfully bought tokens!`);
  console.log(`New token balance: ${buyResult.tokenBalance}`);
} else {
  console.error(`Failed to buy tokens: ${buyResult.error}`);
}
```

## Selling Tokens

To sell tokens on PumpFun:

```typescript
const sellResult = await pumpfun.sellToken(
  'TokenAddressHere',  // Token mint address
  0.5                  // Percentage to sell (0.5 = 50%)
);

if (sellResult.success) {
  console.log(`Successfully sold tokens!`);
  console.log(`Remaining token balance: ${sellResult.tokenBalance}`);
} else {
  console.error(`Failed to sell tokens: ${sellResult.error}`);
}
```

## Getting Token Information

To retrieve information about a token:

```typescript
const tokenInfo = await pumpfun.getTokenBalance('TokenAddressHere');

if (tokenInfo.success) {
  console.log(`Token balance: ${tokenInfo.tokenBalance}`);
} else {
  console.error(`Failed to get token information: ${tokenInfo.error}`);
}
```

## Getting Wallet Information

To check your wallet address and SOL balance:

```typescript
const walletInfo = await pumpfun.getWalletInfo();
console.log(`Wallet address: ${walletInfo.address}`);
console.log(`SOL balance: ${walletInfo.balance}`);
```

## Using the Agent Integration

If you're using the plugin with an Eliza agent, you can use the `PumpFunAgentIntegration` class for a more agent-friendly interface:

```typescript
import { PumpFunAgentIntegration } from '@elizaos/pumpfun-plugin';

const agent = new PumpFunAgentIntegration(
  '/path/to/wallet.json',
  'https://api.devnet.solana.com',
  './token-configs'
);

// Get wallet information
const walletInfoText = await agent.getWalletInfo();
console.log(walletInfoText);

// Launch a token
const tokenLaunchResult = await agent.launchToken(
  'My Token',
  'MYT',
  'My test token',
  0.1,
  './path/to/image.png',
  '@mytoken',
  '@mytoken',
  'https://mytoken.com'
);
console.log(tokenLaunchResult);
```

## Next Steps

For more advanced usage scenarios, check out the [API Reference](./api-reference.md) and [Examples](./examples.md) sections.

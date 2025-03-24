# API Reference

This document provides a comprehensive reference for all classes, methods, and interfaces in the PumpFun Plugin.

## PumpFunPlugin

The main class that provides access to PumpFun functionality.

### Constructor

```typescript
constructor(privateKeyPath: string, rpcUrl: string, configDir: string)
```

- `privateKeyPath`: Path to the Solana wallet private key
- `rpcUrl`: URL of the Solana RPC endpoint
- `configDir`: Directory to store token configurations and keypairs

### Methods

#### launchToken

```typescript
async launchToken(
  name: string,
  symbol: string,
  description: string,
  initialBuyAmount: number,
  imagePath: string,
  socialLinks?: {
    telegram?: string;
    twitter?: string;
    website?: string;
  }
): Promise<TokenLaunchResult>
```

Creates and launches a new token on PumpFun.

**Parameters:**
- `name`: Token name
- `symbol`: Token symbol
- `description`: Token description
- `initialBuyAmount`: Amount of SOL for initial buy
- `imagePath`: Path to token image
- `socialLinks`: Optional social media links

**Returns:**
- `TokenLaunchResult`: Result of the token launch operation

#### buyToken

```typescript
async buyToken(
  mintAddress: string,
  solAmount: number
): Promise<TokenBuyResult>
```

Buys tokens on PumpFun.

**Parameters:**
- `mintAddress`: Token mint address
- `solAmount`: Amount of SOL to spend

**Returns:**
- `TokenBuyResult`: Result of the token buy operation

#### sellToken

```typescript
async sellToken(
  mintAddress: string,
  sellPercentage: number
): Promise<TokenSellResult>
```

Sells tokens on PumpFun.

**Parameters:**
- `mintAddress`: Token mint address
- `sellPercentage`: Percentage of tokens to sell (0-1)

**Returns:**
- `TokenSellResult`: Result of the token sell operation

#### getTokenBalance

```typescript
async getTokenBalance(
  mintAddress: string
): Promise<TokenBalanceResult>
```

Gets the balance of a specific token.

**Parameters:**
- `mintAddress`: Token mint address

**Returns:**
- `TokenBalanceResult`: Token balance information

#### getWalletInfo

```typescript
async getWalletInfo(): Promise<WalletInfo>
```

Gets information about the connected wallet.

**Returns:**
- `WalletInfo`: Wallet address and SOL balance

## PumpFunAgentIntegration

A class designed specifically for integration with Eliza agents.

### Constructor

```typescript
constructor(privateKeyPath: string, rpcUrl: string, configDir: string)
```

- `privateKeyPath`: Path to the Solana wallet private key
- `rpcUrl`: URL of the Solana RPC endpoint
- `configDir`: Directory to store token configurations and keypairs

### Methods

#### getWalletInfo

```typescript
async getWalletInfo(): Promise<string>
```

Gets information about the connected wallet.

**Returns:**
- `string`: Human-readable wallet information

#### launchToken

```typescript
async launchToken(
  name: string,
  symbol: string,
  description: string,
  initialBuyAmount: number,
  imagePath: string,
  telegram?: string,
  twitter?: string,
  website?: string
): Promise<any>
```

Creates and launches a new token on PumpFun.

**Parameters:**
- `name`: Token name
- `symbol`: Token symbol
- `description`: Token description
- `initialBuyAmount`: Amount of SOL for initial buy
- `imagePath`: Path to token image
- `telegram`: Optional Telegram link
- `twitter`: Optional Twitter link
- `website`: Optional Website link

**Returns:**
- Object containing success status, token address, and message

#### buyToken

```typescript
async buyToken(
  tokenAddress: string,
  solAmount: number
): Promise<string>
```

Buys tokens on PumpFun.

**Parameters:**
- `tokenAddress`: Token mint address
- `solAmount`: Amount of SOL to spend

**Returns:**
- `string`: Human-readable result message

#### sellToken

```typescript
async sellToken(
  tokenAddress: string,
  sellPercentage: number
): Promise<string>
```

Sells tokens on PumpFun.

**Parameters:**
- `tokenAddress`: Token mint address
- `sellPercentage`: Percentage of tokens to sell (0-100)

**Returns:**
- `string`: Human-readable result message

#### getTokenBalance

```typescript
async getTokenBalance(
  tokenAddress: string
): Promise<string>
```

Gets the balance of a specific token.

**Parameters:**
- `tokenAddress`: Token mint address

**Returns:**
- `string`: Human-readable token balance information

#### listTokens

```typescript
async listTokens(): Promise<string>
```

Lists all tokens launched by the connected wallet.

**Returns:**
- `string`: Human-readable list of tokens

## PumpFunService

Low-level service for interacting with PumpFun.

### Constructor

```typescript
constructor(privateKeyPath: string, rpcUrl: string)
```

- `privateKeyPath`: Path to the Solana wallet private key
- `rpcUrl`: URL of the Solana RPC endpoint

### Methods

#### getWalletPublicKey

```typescript
getWalletPublicKey(): string
```

Gets the public key of the connected wallet.

**Returns:**
- `string`: Wallet public key

#### getSOLBalance

```typescript
async getSOLBalance(): Promise<number>
```

Gets the SOL balance of the connected wallet.

**Returns:**
- `number`: SOL balance

#### getTokenBalance

```typescript
async getTokenBalance(mintAddress: string): Promise<number | null>
```

Gets the balance of a specific token.

**Parameters:**
- `mintAddress`: Token mint address

**Returns:**
- `number | null`: Token balance or null if error

#### createAndBuyToken

```typescript
async createAndBuyToken(
  mintKeypairPath: string,
  tokenMetadata: TokenMetadata,
  initialBuySolAmount: number
): Promise<CreateAndBuyResult>
```

Creates and buys a token on PumpFun.

**Parameters:**
- `mintKeypairPath`: Path to mint keypair
- `tokenMetadata`: Token metadata
- `initialBuySolAmount`: Amount of SOL for initial buy

**Returns:**
- `CreateAndBuyResult`: Result of the create and buy operation

#### buyToken

```typescript
async buyToken(
  mintAddress: string,
  solAmount: number
): Promise<BuyResult>
```

Buys tokens on PumpFun.

**Parameters:**
- `mintAddress`: Token mint address
- `solAmount`: Amount of SOL to spend

**Returns:**
- `BuyResult`: Result of the buy operation

#### sellToken

```typescript
async sellToken(
  mintAddress: string,
  sellPercentage: number
): Promise<SellResult>
```

Sells tokens on PumpFun.

**Parameters:**
- `mintAddress`: Token mint address
- `sellPercentage`: Percentage of tokens to sell (0-1)

**Returns:**
- `SellResult`: Result of the sell operation

#### generateMintKeypair

```typescript
async generateMintKeypair(outputPath: string): Promise<string>
```

Generates a new mint keypair and saves it to a file.

**Parameters:**
- `outputPath`: Path to save the keypair

**Returns:**
- `string`: Public key of the generated keypair

## Interfaces

### TokenMetadata

```typescript
interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  telegram?: string;
  twitter?: string;
  website?: string;
  file: Blob;
}
```

### TokenLaunchResult

```typescript
interface TokenLaunchResult {
  success: boolean;
  tokenAddress?: string;
  tokenBalance?: number;
  keypairPath?: string;
  pumpfunUrl?: string;
  error?: string;
}
```

### TokenBuyResult

```typescript
interface TokenBuyResult {
  success: boolean;
  tokenBalance?: number;
  pumpfunUrl?: string;
  error?: string;
}
```

### TokenSellResult

```typescript
interface TokenSellResult {
  success: boolean;
  tokenBalance?: number;
  pumpfunUrl?: string;
  error?: string;
}
```

### TokenBalanceResult

```typescript
interface TokenBalanceResult {
  success: boolean;
  tokenBalance?: number;
  pumpfunUrl?: string;
  error?: string;
}
```

### WalletInfo

```typescript
interface WalletInfo {
  address: string;
  balance: number;
}
```

### CreateAndBuyResult

```typescript
interface CreateAndBuyResult {
  success: boolean;
  mintAddress?: string;
  tokenBalance?: number | null | undefined;
  bondingCurve?: any;
}
```

### BuyResult

```typescript
interface BuyResult {
  success: boolean;
  tokenBalance?: number | null | undefined;
  bondingCurve?: any;
}
```

### SellResult

```typescript
interface SellResult {
  success: boolean;
  tokenBalanceAfterSell?: number | null | undefined;
  bondingCurve?: any;
}

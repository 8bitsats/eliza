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

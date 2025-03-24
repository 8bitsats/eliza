# Token Launcher Testing Guide

## Overview

The Token Launcher system includes comprehensive testing capabilities to ensure proper functionality in both development and production environments. This guide outlines the available testing options, how to use them, and how to verify that the token launcher is working correctly.

## Testing Modes

The Token Launcher supports three main testing modes:

### 1. Simple Mock Test

Ideal for quick verification during development, this mode simulates the token launch process without connecting to any blockchain.

**How to activate**:
- Enable test mode in the UI and select "mock"
- Or set `testMode: { enabled: true, mode: 'mock' }` in the test mode context

**Features**:
- Simulated token data
- No blockchain connection required
- Instant feedback for UI testing

### 2. Test Mode on Devnet

Uses a randomly generated keypair to test on Solana devnet without requiring a real private key.

**How to activate**:
- Enable test mode in the UI and select "devnet"
- Or set `testMode: { enabled: true, mode: 'devnet' }` in the test mode context

**Features**:
- Uses Solana devnet network
- Creates real, but test transactions
- Allows full testing of the launch pipeline

### 3. Real Token Launch Options

Real token launches can be performed on either devnet (for testing) or mainnet (for production).

**For Devnet**:
- Disable test mode in the UI
- Set network to "devnet" in the token launch form

**For Mainnet**:
- Disable test mode in the UI
- Set network to "mainnet" in the token launch form
- Ensure a real private key is used

## Debugging Tools

To aid in testing and debugging, we've added several utilities:

### Debug Utilities

The `debug-utils.ts` module provides logging utilities for different components:

```typescript
import { logInfo, logError, logDebug } from './utils/debug-utils';

// Log different levels of information
logInfo('token-list', 'Loading token list', { testMode });
logError('token-service', 'API error', error);
logDebug('trending-tokens', 'API response', response);
```

### Debug Test Script

A comprehensive debug script is available in `debug-token-launcher.ts` that tests all token launcher functionality with different test modes.

To manually run a debug session:

```typescript
import { startDebugSession } from './debug-token-launcher';

// Call this in the browser console or add a debug button
startDebugSession();
```

## Common Issues and Solutions

### Type Errors

If you encounter type errors related to token data, check:

1. Ensure you're using the right type (TokenMetadata or TrendingToken)
2. Use the normalizeToken function in TokenVisualizer to convert between types
3. Verify all required fields are present in your token objects

### Network Issues

If you have problems connecting to the Solana network:

1. Verify you're using the correct network for your test mode
2. Check that RPC endpoints are correctly configured
3. For devnet testing, ensure you have a valid keypair

### UI Component Issues

If UI components aren't rendering correctly:

1. Verify all imports are correctly specified
2. Check that required UI components exist in the project
3. Ensure the CSS is properly loaded

## Conclusion

By using the different test modes and debugging tools, you can thoroughly test the Token Launcher system before deploying to production. The test mode context makes it easy to switch between testing environments without modifying code.

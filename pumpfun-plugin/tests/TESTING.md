# Pump Fun Token Launcher Testing Guide

This directory contains three testing approaches for the Pump Fun Token Launcher:

1. **Simple Mock Test** (`test-simple.ts`)
   - Simulates token launch process without blockchain connection
   - Useful for quick verification during development
   - No real network calls or private keys needed

2. **Test Mode on Devnet** (`test-launch.ts`)
   - Uses randomly generated keypair
   - Tests on Solana devnet
   - No real private key required
   - Validates actual blockchain interactions

3. **Real Token Launch Testing**
   - Use `launch-token.js` with appropriate network parameter
   - Options for both devnet and mainnet testing
   - Requires real wallet configuration

## Running Tests

```bash
# Run simple mock test
pnpm test:simple

# Run devnet test
pnpm test:devnet

# Run a real token launch on devnet
node examples/launch-token.js --network=devnet [other params...]

# Run a real token launch on mainnet
node examples/launch-token.js --network=mainnet [other params...]
```

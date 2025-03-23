# Testing the Ordinals Plugin

This document outlines the testing approach for the Ordinals Plugin, which provides functionality to interact with Bitcoin Ordinals inscriptions.

## Testing Options

The Ordinals Plugin offers multiple testing options to accommodate different development and testing scenarios:

### 1. Mock Mode Testing

Mock mode allows you to test the plugin's functionality without requiring a real Bitcoin node or Hiro API key.

```bash
npm run test:mock
```

In mock mode:

- All API calls are simulated with mock data
- No real blockchain interactions occur
- Perfect for quick development and testing

### 2. Hiro API Testing

This mode tests the plugin with the real Hiro API to verify inscription data retrieval:

```bash
# Set your Hiro API key first
export HIRO_API_KEY=your_hiro_api_key
npm run test:hiro
```

This test:

- Connects to the real Hiro API
- Retrieves real inscription data
- Tests all API endpoints
- Does not require a local Bitcoin node

### 3. Testnet Testing

For testing with a real Bitcoin testnet node:

```bash
# Set required environment variables
export ORD_PATH=/path/to/ord
export BITCOIN_CONF_PATH=/path/to/bitcoin.conf
export BITCOIN_RPC_USER=your_rpc_user
export BITCOIN_RPC_PASSWORD=your_rpc_password
export HIRO_API_KEY=your_hiro_api_key

npm run test:testnet
```

This test:

- Connects to a Bitcoin testnet node
- Uses both local ord commands and Hiro API
- Tests all plugin functionality
- Requires a running Bitcoin testnet node

### 4. Mainnet Testing

For testing with a real Bitcoin mainnet node (use with caution):

```bash
# Set required environment variables
export ORD_PATH=/path/to/ord
export BITCOIN_CONF_PATH=/path/to/bitcoin.conf
export BITCOIN_RPC_USER=your_rpc_user
export BITCOIN_RPC_PASSWORD=your_rpc_password
export HIRO_API_KEY=your_hiro_api_key

npm run test:mainnet
```

This test:

- Connects to a Bitcoin mainnet node
- Uses both local ord commands and Hiro API
- Tests all plugin functionality with real Bitcoin
- Requires a running Bitcoin mainnet node
- **Warning**: Use with caution as this interacts with real Bitcoin

## Setting Up for Testing

### Prerequisites

1. **For Hiro API Testing**:

   - Obtain a Hiro API key from [hiro.so](https://hiro.so)
   - Set the `HIRO_API_KEY` environment variable

2. **For Local Node Testing**:

   - Install [Bitcoin Core](https://bitcoin.org/en/download)
   - Install [ord](https://github.com/ordinals/ord)
   - Configure Bitcoin Core with RPC access
   - Set the required environment variables

### Environment Variables

- `ORD_PATH`: Path to the `ord` binary
- `BITCOIN_CONF_PATH`: Path to the Bitcoin configuration file
- `BITCOIN_RPC_USER`: Bitcoin RPC username
- `BITCOIN_RPC_PASSWORD`: Bitcoin RPC password
- `HIRO_API_KEY`: API key for accessing the Hiro services
- `ORD_MOCK_MODE`: Set to 'true' for mock testing
- `BITCOIN_NETWORK`: Set to 'testnet' or 'mainnet'

## Character Configuration

When using the Ordinals Plugin with an ElizaOS character, configure the character JSON file with the Hiro API key:

```json
{
  "name": "Ordinals Character",
  "description": "A character that can interact with Bitcoin Ordinals",
  "plugin": "@elizaos/plugin-ordinals",
  "pluginConfig": {
    "hiroApiKey": "your_hiro_api_key"
  }
}
```

The plugin will automatically use the API key from the character configuration.

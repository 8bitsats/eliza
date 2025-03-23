# Ordinals Plugin for ElizaOS

## Overview

The Ordinals Plugin provides functionality to interact with Bitcoin Ordinals, allowing ElizaOS characters to retrieve inscription content, find rare satoshis, and manage ordinals-related operations.

## Features

- **Inscription Content Retrieval**: Get content and metadata of Bitcoin Ordinals inscriptions
- **Inscription Listing**: List inscriptions with filtering options
- **Satoshi Information**: Get details about specific satoshis by ordinal number
- **Transfers Tracking**: Track transfers of inscriptions
- **Rare Satoshi Discovery**: Find rare satoshis by rarity level
- **Wallet Operations**: View wallet balance and list inscriptions in the wallet
- **Inscription Creation**: Inscribe content onto satoshis

## Installation

```bash
npm install @elizaos/plugin-ordinals
```

## Configuration

The plugin requires a Hiro API key for accessing the Hiro Ordinals API. You can set this in your character configuration:

```json
{
  "name": "Ordinals Character",
  "description": "A character that can interact with Bitcoin Ordinals",
  "plugins": ["@elizaos/plugin-ordinals"],
  "settings": {
    "secrets": {
      "HIRO_API_KEY": "0b2f454a8ad64a5bd5a16a2a084d8ee5"
    }
  }
}
```

Alternatively, you can set the following environment variables:

```bash
export HIRO_API_KEY=0b2f454a8ad64a5bd5a16a2a084d8ee5
export ORD_PATH=/path/to/ord
export BITCOIN_CONF_PATH=/path/to/bitcoin.conf
```

## Usage

The plugin provides the following actions that can be used by ElizaOS characters:

### GET_INSCRIPTION_CONTENT

Retrieve the content of a specific inscription.

```javascript
const content = await runtime.executeAction('GET_INSCRIPTION_CONTENT', { id: 'inscription_id' });
```

### GET_INSCRIPTIONS

Get a list of inscriptions with optional filtering.

```javascript
const inscriptions = await runtime.executeAction('GET_INSCRIPTIONS', {
  limit: 20,
  offset: 0,
  mime_type: ['image/png', 'text/plain'],
  address: ['bc1...'],
  genesis_address: ['bc1...'],
  rarity: ['common', 'uncommon']
});
```

### GET_INSCRIPTION

Get details about a specific inscription.

```javascript
const inscription = await runtime.executeAction('GET_INSCRIPTION', { id: 'inscription_id' });
```

### GET_SATOSHI_INFO

Get information about a specific satoshi by its ordinal number.

```javascript
const satoshi = await runtime.executeAction('GET_SATOSHI_INFO', { ordinal: '1232735286933201' });
```

### GET_SATOSHI_INSCRIPTIONS

Get inscriptions associated with a specific satoshi.

```javascript
const inscriptions = await runtime.executeAction('GET_SATOSHI_INSCRIPTIONS', {
  ordinal: '1232735286933201',
  limit: 20,
  offset: 0
});
```

### GET_INSCRIPTION_TRANSFERS

Get transfers for a specific inscription.

```javascript
const transfers = await runtime.executeAction('GET_INSCRIPTION_TRANSFERS', {
  id: 'inscription_id',
  limit: 20,
  offset: 0
});
```

### FIND_RARE_SATOSHIS

Find rare satoshis using the ord tool.

```javascript
const rareSatoshis = await runtime.executeAction('FIND_RARE_SATOSHIS', { rarity: 'uncommon' });
```

### GET_WALLET_BALANCE

Get the current wallet balance.

```javascript
const balance = await runtime.executeAction('GET_WALLET_BALANCE');
```

### LIST_WALLET_INSCRIPTIONS

List all inscriptions in the wallet.

```javascript
const inscriptions = await runtime.executeAction('LIST_WALLET_INSCRIPTIONS');
```

### INSCRIBE_DATA

Inscribe data onto a satoshi.

```javascript
const result = await runtime.executeAction('INSCRIBE_DATA', {
  data: 'Hello, Ordinals!',
  contentType: 'text/plain'
});
```

## Testing

The plugin includes multiple testing options:

```bash
# Mock testing (no real API calls)
npm run test:mock

# Hiro API testing (requires API key)
npm run test:hiro

# Testnet testing (requires Bitcoin node)
npm run test:testnet

# Mainnet testing (use with caution)
npm run test:mainnet
```

See [TESTING.md](./TESTING.md) for detailed testing instructions.

## API Reference

The plugin uses two main classes:

### OrdinalsAPI

Provides methods to interact with both local and Hiro Ordinals APIs.

- `getInscriptions(options)`: Get a list of inscriptions
- `getInscription(id)`: Get details about a specific inscription
- `getInscriptionContent(id)`: Get the content of a specific inscription
- `getSatoshi(ordinal)`: Get information about a specific satoshi
- `getSatoshiInscriptions(ordinal, options)`: Get inscriptions for a satoshi
- `getInscriptionTransfers(id, options)`: Get transfers for an inscription

### OrdinalsUtils

Provides utility functions for executing commands related to Bitcoin Ordinals.

- `runOrdCommand(args)`: Run a command with the ord tool
- `findSatoshisByRarity(rarity)`: Find satoshis by rarity level
- `inscribeContent(content, contentType)`: Inscribe content onto a satoshi
- `getWalletBalance()`: Get the current wallet balance
- `listWalletInscriptions()`: List inscriptions in the wallet

## Dependencies

- Node.js 16+
- Bitcoin Core (for local node operations)
- ord tool (for local inscriptions and rare satoshi discovery)
- Hiro API key (for API access)

## License

MIT

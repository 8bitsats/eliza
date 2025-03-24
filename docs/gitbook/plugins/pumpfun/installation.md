# Installation and Setup

This guide will walk you through installing and configuring the PumpFun Plugin for your Eliza agent.

## Prerequisites

Before you begin, make sure you have:

- Node.js (v18.0.0 or higher)
- pnpm package manager (v7.0.0 or higher)
- Solana CLI tools (optional, but recommended)
- A Solana wallet with private key (for token operations)
- Access to Solana RPC endpoint (devnet or mainnet)

## Installation

### 1. Clone the Repository

If you're adding the PumpFun Plugin to an existing Eliza project:

```bash
cd /path/to/your/eliza
git clone https://github.com/yourusername/pumpfun-plugin.git plugins/pumpfun-plugin
```

### 2. Install Dependencies

Navigate to the plugin directory and install dependencies:

```bash
cd plugins/pumpfun-plugin
pnpm install
```

### 3. Build the Plugin

Compile the TypeScript code:

```bash
pnpm build
```

## Configuration

### 1. Create a Solana Wallet

If you don't have a Solana wallet yet, create one using the Solana CLI:

```bash
solana-keygen new --outfile /path/to/your/wallet.json
```

This will generate a new Solana wallet and save the keypair to the specified file.

### 2. Set Up Configuration

Create a `.env` file in the plugin directory with the following content:

```
SOLANA_PRIVATE_KEY_PATH=/path/to/your/wallet.json
SOLANA_RPC_URL=https://api.devnet.solana.com  # Use mainnet for production
TOKEN_CONFIG_DIR=/path/to/store/token/configs
```

### 3. Link with Eliza

In your Eliza configuration file (`elizaConfig.yaml`), add the PumpFun Plugin:

```yaml
plugins:
  - name: pumpfun
    enabled: true
    path: ./plugins/pumpfun-plugin
```

## Verifying Installation

To verify that the plugin is correctly installed and configured:

```bash
cd plugins/pumpfun-plugin
pnpm test:simple
```

All tests should pass, indicating that the plugin is correctly set up.

## Docker Setup (Optional)

The plugin can also be run in a Docker container. A `Dockerfile` and `docker-compose.yml` are provided for this purpose.

```bash
# Build the Docker image
docker build -t pumpfun-plugin .

# Run using docker-compose
docker-compose up
```

## Next Steps

Once the PumpFun Plugin is installed and configured, proceed to the [Basic Usage](./basic-usage.md) section to learn how to use the plugin with your agent.

# Installation Guide

This guide will walk you through the process of installing and setting up the Solana Token Launcher on your system.

## Prerequisites

Before installing the Solana Token Launcher, ensure your system meets the following requirements:

- **Node.js**: Version 16 or higher
- **npm** or **yarn**: Latest stable version
- **Git**: For cloning repositories
- **Operating System**: macOS, Linux, or Windows 10/11

Optional but recommended:
- **Solana CLI**: For advanced blockchain operations
- **Docker**: For containerized deployment

## Installation Steps

### 1. Clone the Repository

First, clone the Eliza repository and navigate into the directory:

```bash
git clone https://github.com/your-org/eliza.git
cd eliza
```

### 2. Set Up PumpFun Raydium CLI Tools

Clone the PumpFun Raydium CLI tools repository into your Eliza project:

```bash
git clone https://github.com/your-org/pumpfun-raydium-cli-tools.git
```

Alternatively, if you already have the repository, ensure it's located in the correct path:

```
/Users/[username]/Desktop/eliza/pumpfun-raydium-cli-tools-main
```

### 3. Install Server Dependencies

Navigate to the server directory and install the required dependencies:

```bash
cd server
npm install express cors multer uuid axios
cd ..
```

### 4. Install Plugin Dependencies

Navigate to the PumpFun plugin directory and install its dependencies:

```bash
cd plugins/pumpfun-plugin
npm install
npm install uuid
cd ../..
```

### 5. Build the Plugin

Build the PumpFun plugin to make it ready for use:

```bash
cd plugins/pumpfun-plugin
npm run build
cd ../..
```

### 6. Make the Startup Script Executable

Ensure the startup script has executable permissions:

```bash
chmod +x start-token-launcher.sh
```

## Configuration

### Create Necessary Directories

The token launcher requires specific directories for storing wallet information, token data, and images. The startup script will create these automatically, but you can manually create them if needed:

```bash
mkdir -p ~/.config/eliza/pumpfun/images
mkdir -p ~/.config/eliza/pumpfun/wallets
mkdir -p ~/.config/eliza/pumpfun/tokens
```

### Solana RPC Setup

The token launcher uses Solana's RPC API to interact with the blockchain. By default, it connects to the mainnet, but you can configure different RPC endpoints by modifying the `.env` file in the PumpFun directory:

```bash
# For mainnet:
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# For devnet (recommended for testing):
SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Verification

To verify that the installation was successful, run the startup script:

```bash
./start-token-launcher.sh
```

This should:
1. Set up required directories if they don't exist
2. Start the Token API server on port 3001
3. Display a success message

Next, navigate to `http://localhost:3000/token-launcher` in your web browser. You should see the Token Launcher interface.

## Next Steps

Now that you have installed the Solana Token Launcher, you can:

- [Configure settings](./configuration.md) to customize your installation
- Follow the [Quick Start guide](./quick-start.md) to launch your first token
- Learn about the [architecture](../core-concepts/architecture.md) of the token launcher

If you encounter any issues during installation, refer to the [Troubleshooting](../troubleshooting/common-issues.md) section.

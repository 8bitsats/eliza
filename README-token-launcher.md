# Solana Token Launcher

## Integration between Eliza and PumpFun Raydium CLI Tools

This project integrates the Eliza framework with PumpFun's Raydium CLI tools to provide a comprehensive token launching and trading system for Solana.

## Features

- **Token Creation**: Launch custom tokens with personalized metadata and images
- **Token Trading**: Buy and sell tokens with real-time price data
- **Token Visualization**: View detailed token metrics and activity
- **Trending Analysis**: Discover popular tokens in the ecosystem
- **Agent Integration**: Connect token operations with AI agents

## Architecture

The integration consists of three main components:

1. **Frontend**: React UI components in the Eliza client
2. **API Layer**: Express server handling token operations
3. **Backend**: PumpFun Raydium CLI tools for blockchain interactions

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd server
   npm install express cors multer uuid axios
   
   cd ../plugins/pumpfun-plugin
   npm install
   npm install uuid
   ```
3. Build the plugin:
   ```
   cd plugins/pumpfun-plugin
   npm run build
   ```
4. Make the startup script executable:
   ```
   chmod +x start-token-launcher.sh
   ```

### Usage

1. Start the token launcher:
   ```
   ./start-token-launcher.sh
   ```
2. Access the token launcher interface at:
   http://localhost:3000/token-launcher

## Documentation

For comprehensive documentation, see the following resources:

- [Token Launcher Guide](./docs/token-launcher-guide.md): Complete usage guide
- [GitBook Documentation](./docs/gitbook/README.md): Structured documentation

## Integration with AI Agents

The token launcher can be integrated with AI agents to automate token operations. See the [Agent Integration](./docs/gitbook/developer/agent-integration.md) guide for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Eliza Framework](https://github.com/your-org/eliza)
- [PumpFun Raydium CLI Tools](https://github.com/your-org/pumpfun-raydium-cli-tools)
- [Solana](https://solana.com)
- [Raydium](https://raydium.io)

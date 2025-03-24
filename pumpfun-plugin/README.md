# PumpFun Plugin

A plugin for launching and trading tokens on PumpFun.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a wallet.json file in the root directory with your Solana private key.

3. Create a tokens directory in the root:

```bash
mkdir tokens
```

## Running the Agent

### Local Development

```bash
# Start in development mode with auto-reload
pnpm start:dev

# Start in production mode
pnpm start
```

### Docker with ngrok

1. Install Docker and Docker Compose if you haven't already.

2. Sign up for a free ngrok account at [https://ngrok.com](https://ngrok.com) and get your auth token.

3. Create a `.env` file in the root directory:

```bash
NGROK_AUTHTOKEN=your_ngrok_auth_token
```

4. Start the services:

```bash
docker-compose up -d
```

5. View your public URL:

```bash
# Open ngrok dashboard
open http://localhost:4040
```

The ngrok URL displayed in the dashboard is your public agent endpoint.

## API Endpoints

### Launch Token

```http
POST /launch-token
Content-Type: application/json

{
  "name": "Test Token",
  "symbol": "TEST",
  "description": "A test token",
  "initialBuyAmount": 0.5,
  "imagePath": "/path/to/image.png",
  "telegram": "@test",
  "twitter": "@test",
  "website": "https://test.com"
}
```

### Health Check

```http
GET /health
```

## Testing

See [TESTING.md](./TESTING.md) for detailed testing instructions.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `RPC_URL`: Solana RPC URL (default: https://api.devnet.solana.com)
- `WALLET_PATH`: Path to wallet.json (default: ./wallet.json)
- `TOKEN_DIR`: Directory for token files (default: ./tokens)
- `NGROK_AUTHTOKEN`: Your ngrok auth token (required for ngrok tunnel)

## Important Notes

- Always use a dedicated wallet for testing and development
- Never share your private keys or commit them to version control
- When using mainnet, double-check all parameters before launching tokens

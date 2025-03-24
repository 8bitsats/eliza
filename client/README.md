# Eliza Client

A modern web application for launching and managing Solana tokens with integrated DNA art generation capabilities.

## Features

- Token Launcher with support for Solana blockchain
- Real-time trending token ticker using Solana Tracker API
- DNA Art Generator powered by NVIDIA's Health API
- Modern UI with shadcn/ui components

## Setup

1. Clone the repository

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

4. Add your API keys to the `.env` file:

   ```env
   VITE_SOLANA_TRACKER_API_KEY=your_api_key_here
   ```

## Development

Run the development server:

```bash
pnpm dev
```

## Building

Build for production:

```bash
pnpm build
```

## Testing

We support multiple testing options:

1. Simple Mock Test
2. Test Mode on Devnet
3. Real Token Launch testing

See `TESTING.md` for detailed testing instructions.

## Environment Variables

- `VITE_SOLANA_TRACKER_API_KEY`: API key for Solana Tracker (required for trending tokens feature)

## Technologies

- React + TypeScript
- Vite
- shadcn/ui
- Solana Web3.js
- NVIDIA Health API
- Solana Tracker API

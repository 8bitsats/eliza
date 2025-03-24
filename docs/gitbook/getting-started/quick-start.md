# Quick Start Guide

This guide will help you quickly get started with the Solana Token Launcher.

## Prerequisites

Ensure you have completed the [installation](./installation.md) process before proceeding.

## Launch the Token Launcher

1. Open a terminal and navigate to your Eliza project directory
2. Run the startup script:

```bash
./start-token-launcher.sh
```

3. The script will:
   - Create necessary configuration directories
   - Start the Token API server on port 3001
   - Display a success message

4. Navigate to `http://localhost:3000/token-launcher` in your web browser

## First-Time Setup

### Set Up Your Wallet

1. In the Token Launcher interface, click on the **Trade Tokens** tab
2. If no wallet is configured, you'll see a prompt to set up a wallet
3. Click "Setup Wallet" and provide a name if desired
4. The system will create a new wallet or use an existing one from PumpFun
5. Your wallet address and SOL balance will be displayed

### Launch Your First Token

1. Navigate to the **Launch Token** tab
2. Fill in the token details:
   - **Name**: Choose a name for your token
   - **Symbol**: Create a short identifier (typically uppercase)
   - **Description**: Provide information about your token
   - **Initial Buy Amount**: Set the amount of SOL to invest
   - **Token Image**: Upload an image for your token
3. Optionally add social links (Telegram, Twitter, Website)
4. Click "Launch Token"
5. The system will process your request and display a success message
6. You'll be redirected to the **Visualize Token** tab to see your new token

### View Your Tokens

1. Navigate to the **My Tokens** tab
2. You'll see a list of all tokens you've launched
3. Click on any token to view its details in the **Visualize Token** tab

### Trade Tokens

1. Navigate to the **Trade Tokens** tab
2. Select a token from the dropdown
3. To buy more of a token:
   - Select the "Buy" tab
   - Enter SOL amount
   - Click "Buy [Symbol]"
4. To sell a token:
   - Select the "Sell" tab
   - Use the slider to choose percentage to sell
   - Click "Sell [Percentage]% of [Symbol]"

### Explore Trending Tokens

1. Navigate to the **Trending** tab
2. Browse the list of trending tokens sorted by activity
3. View metrics such as price, 24h change, and trading volume
4. Click "View" on any token to see more details

## Next Steps

Now that you've successfully launched and traded your first token, you can:

- Learn more about [token lifecycle](../core-concepts/token-lifecycle.md)
- Explore advanced [wallet management](../core-concepts/wallet-management.md)
- Customize [token visualization](../user-guide/visualize-tokens.md)
- Set up a [trading bot](../tutorials/trading-bot.md)

For more detailed instructions on each feature, consult the appropriate sections in the user guide.

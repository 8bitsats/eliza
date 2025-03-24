#!/usr/bin/env node
const { PumpFunAgentIntegration } = require('../src/agent-integration');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration directories
const CONFIG_DIR = path.join(os.homedir(), '.config', 'eliza', 'pumpfun');
const WALLET_DIR = path.join(CONFIG_DIR, 'wallets');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default RPC URL
const DEFAULT_RPC_URL = 'https://api.mainnet-beta.solana.com';

// Parse arguments
const args = process.argv.slice(2);
let walletName = null;

args.forEach(arg => {
  if (arg.startsWith('--name=')) {
    walletName = arg.replace('--name=', '');
  }
});

// Generate wallet name if not provided
walletName = walletName || `wallet-${Date.now().toString(36)}`;
const walletPath = path.join(WALLET_DIR, `${walletName}.json`);

// Ensure directories exist
[CONFIG_DIR, WALLET_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize configuration if not exists
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE, 
    JSON.stringify({
      rpcUrl: DEFAULT_RPC_URL,
      activeWallet: null,
      wallets: []
    }, null, 2), 
    'utf-8'
  );
}

// Read configuration
let config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

async function setupWallet() {
  try {
    // Use existing wallet from pumpfun-raydium-cli-tools
    const externalWalletPath = path.join(
      process.cwd(), '../../pumpfun-raydium-cli-tools-main/data/payer_keypair/dev-wallet.json'
    );
    
    if (fs.existsSync(externalWalletPath)) {
      // Copy the wallet file
      fs.copyFileSync(externalWalletPath, walletPath);
      
      // Update config
      config.wallets = config.wallets.filter(w => w.name !== walletName);
      config.wallets.push({ name: walletName, path: walletPath });
      config.activeWallet = walletName;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
      
      // Initialize agent
      const pumpFunAgent = new PumpFunAgentIntegration(
        walletPath,
        config.rpcUrl,
        path.join(CONFIG_DIR, 'tokens')
      );
      
      // Get wallet info
      const walletInfo = await pumpFunAgent.getWalletInfo();
      console.log('Wallet setup successful');
      console.log(walletInfo);
    } else {
      console.error('Could not find wallet file to copy.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error setting up wallet:', error);
    process.exit(1);
  }
}

setupWallet();

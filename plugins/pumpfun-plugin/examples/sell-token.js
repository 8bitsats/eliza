#!/usr/bin/env node
const { PumpFunAgentIntegration } = require('../src/agent-integration');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration directories
const CONFIG_DIR = path.join(os.homedir(), '.config', 'eliza', 'pumpfun');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOKEN_DIR = path.join(CONFIG_DIR, 'tokens');

// Parse arguments
const args = process.argv.slice(2);
let tokenAddress = '';
let percentage = 50;

args.forEach(arg => {
  if (arg.startsWith('--tokenAddress=')) {
    tokenAddress = arg.replace('--tokenAddress=', '');
  } else if (arg.startsWith('--percentage=')) {
    percentage = parseInt(arg.replace('--percentage=', ''));
  }
});

// Validate required arguments
if (!tokenAddress) {
  console.error('Missing required argument: tokenAddress is required');
  process.exit(1);
}

// Validate percentage
if (percentage < 1 || percentage > 100) {
  console.error('Invalid percentage: percentage must be between 1 and 100');
  process.exit(1);
}

// Ensure directories exist
[CONFIG_DIR, TOKEN_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read configuration
if (!fs.existsSync(CONFIG_FILE)) {
  console.error('Configuration file not found. Please run setup-wallet.js first.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
if (!config.activeWallet) {
  console.error('No active wallet found. Please run setup-wallet.js first.');
  process.exit(1);
}

const activeWalletInfo = config.wallets.find(w => w.name === config.activeWallet);
if (!activeWalletInfo) {
  console.error('Active wallet not found in configuration. Please run setup-wallet.js first.');
  process.exit(1);
}

async function sellToken() {
  try {
    // Initialize agent
    const pumpFunAgent = new PumpFunAgentIntegration(
      activeWalletInfo.path,
      config.rpcUrl,
      TOKEN_DIR
    );
    
    // Sell token
    const result = await pumpFunAgent.sellToken(tokenAddress, percentage);
    
    console.log(result);
  } catch (error) {
    console.error('Error selling token:', error);
    process.exit(1);
  }
}

sellToken();

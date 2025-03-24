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
let solAmount = 0.1;

args.forEach(arg => {
  if (arg.startsWith('--tokenAddress=')) {
    tokenAddress = arg.replace('--tokenAddress=', '');
  } else if (arg.startsWith('--solAmount=')) {
    solAmount = parseFloat(arg.replace('--solAmount=', ''));
  }
});

// Validate required arguments
if (!tokenAddress) {
  console.error('Missing required argument: tokenAddress is required');
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

async function buyToken() {
  try {
    // Initialize agent
    const pumpFunAgent = new PumpFunAgentIntegration(
      activeWalletInfo.path,
      config.rpcUrl,
      TOKEN_DIR
    );
    
    // Buy token
    const result = await pumpFunAgent.buyToken(tokenAddress, solAmount);
    
    console.log(result);
  } catch (error) {
    console.error('Error buying token:', error);
    process.exit(1);
  }
}

buyToken();

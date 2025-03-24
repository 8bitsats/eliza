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
let name = '';
let symbol = '';
let description = '';
let initialBuyAmount = 0.5;
let imagePath = '';
let telegram = '';
let twitter = '';
let website = '';

args.forEach(arg => {
  if (arg.startsWith('--name=')) {
    name = arg.replace('--name=', '');
  } else if (arg.startsWith('--symbol=')) {
    symbol = arg.replace('--symbol=', '');
  } else if (arg.startsWith('--description=')) {
    description = arg.replace('--description=', '');
  } else if (arg.startsWith('--initialBuyAmount=')) {
    initialBuyAmount = parseFloat(arg.replace('--initialBuyAmount=', ''));
  } else if (arg.startsWith('--imagePath=')) {
    imagePath = arg.replace('--imagePath=', '');
  } else if (arg.startsWith('--telegram=')) {
    telegram = arg.replace('--telegram=', '');
  } else if (arg.startsWith('--twitter=')) {
    twitter = arg.replace('--twitter=', '');
  } else if (arg.startsWith('--website=')) {
    website = arg.replace('--website=', '');
  }
});

// Validate required arguments
if (!name || !symbol || !description || !imagePath) {
  console.error('Missing required arguments: name, symbol, description, and imagePath are required');
  process.exit(1);
}

// Validate image path
if (!fs.existsSync(imagePath)) {
  console.error(`Image file not found at ${imagePath}`);
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

async function launchToken() {
  try {
    // Initialize agent
    const pumpFunAgent = new PumpFunAgentIntegration(
      activeWalletInfo.path,
      config.rpcUrl,
      TOKEN_DIR
    );
    
    // Launch token
    const result = await pumpFunAgent.launchToken(
      name,
      symbol,
      description,
      initialBuyAmount,
      imagePath,
      telegram,
      twitter,
      website
    );
    
    console.log(result);
  } catch (error) {
    console.error('Error launching token:', error);
    process.exit(1);
  }
}

launchToken();

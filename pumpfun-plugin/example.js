const { PumpFunAgentIntegration } = require('./dist/agent-integration');

/**
 * Example of using the PumpFun plugin with an agent
 */
async function runExample() {
  try {
    // Configuration
    const privateKeyPath = '/Users/8bit/Desktop/eliza/pumpfun-raydium-cli-tools-main/data/payer_keypair/your-wallet-keypair.json'; // Update this
    const rpcUrl = 'https://api.mainnet-beta.solana.com'; // Or use a different RPC endpoint
    const configDir = '/Users/8bit/Desktop/eliza/plugins/pumpfun-plugin/token-data';
    
    // Initialize PumpFun agent integration
    console.log('Initializing PumpFun agent integration...');
    const pumpFunAgent = new PumpFunAgentIntegration(privateKeyPath, rpcUrl, configDir);
    
    // Get wallet information
    console.log('\nGetting wallet information:');
    const walletInfo = await pumpFunAgent.getWalletInfo();
    console.log(walletInfo);
    
    // Example: List existing tokens
    console.log('\nListing existing tokens:');
    const tokenList = await pumpFunAgent.listTokens();
    console.log(tokenList);
    
    // Uncomment the following sections when you're ready to test them
    
    /*
    // Example: Launch a new token
    console.log('\nLaunching a new token:');
    const launchResult = await pumpFunAgent.launchToken(
      'Eliza Token',                        // Token name
      'ELIZA',                              // Token symbol
      'An AI-created token for testing',    // Token description
      0.1,                                  // Initial buy amount in SOL (be careful with this value)
      '/path/to/your/token-image.png',      // Path to token image
      'https://t.me/elizatoken',            // Telegram link (optional)
      'https://twitter.com/elizatoken',     // Twitter link (optional)
      'https://elizatoken.com'              // Website link (optional)
    );
    console.log(launchResult);
    
    // Note: After launching, you'll get a token address. Use it for the operations below.
    const tokenAddress = 'YOUR_TOKEN_ADDRESS_HERE'; // Replace with your actual token address
    
    // Example: Buy tokens
    console.log('\nBuying tokens:');
    const buyResult = await pumpFunAgent.buyToken(tokenAddress, 0.05); // Buy with 0.05 SOL
    console.log(buyResult);
    
    // Example: Get token balance
    console.log('\nGetting token balance:');
    const balanceResult = await pumpFunAgent.getTokenBalance(tokenAddress);
    console.log(balanceResult);
    
    // Example: Sell tokens
    console.log('\nSelling tokens:');
    const sellResult = await pumpFunAgent.sellToken(tokenAddress, 50); // Sell 50% of tokens
    console.log(sellResult);
    */
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample();

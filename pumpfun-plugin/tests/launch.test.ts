import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { PumpFunAgentIntegration } from '../src/agent-integration';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const TEST_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  tokenDir: path.join(os.tmpdir(), 'pumpfun-test', 'tokens'),
  testWalletPath: path.join(os.tmpdir(), 'pumpfun-test', 'test-wallet.json')
};

async function setupTestEnvironment(): Promise<Keypair> {
  // Create test directories
  fs.mkdirSync(TEST_CONFIG.tokenDir, { recursive: true });
  
  // Generate a test keypair
  const testKeypair = Keypair.generate();
  
  // Save test wallet
  fs.writeFileSync(TEST_CONFIG.testWalletPath, JSON.stringify({
    privateKey: Array.from(testKeypair.secretKey)
  }));
  
  return testKeypair;
}

async function cleanupTestEnvironment(): Promise<void> {
  try {
    fs.rmSync(path.dirname(TEST_CONFIG.tokenDir), { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
  }
}

async function requestAirdrop(connection: Connection, publicKey: PublicKey): Promise<void> {
  try {
    const signature = await connection.requestAirdrop(publicKey, 2 * 1e9); // 2 SOL
    await connection.confirmTransaction(signature);
    console.log('Airdrop successful');
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    // Setup test environment
    const testKeypair = await setupTestEnvironment();
    
    // Setup connection and request airdrop
    const connection = new Connection(TEST_CONFIG.rpcUrl, 'confirmed');
    await requestAirdrop(connection, testKeypair.publicKey);
    
    // Initialize agent with test wallet
    const agent = new PumpFunAgentIntegration(
      TEST_CONFIG.testWalletPath,
      TEST_CONFIG.rpcUrl,
      TEST_CONFIG.tokenDir
    );
    
    // Test token parameters
    const tokenParams = {
      name: 'Test Token ' + Date.now(),
      symbol: 'TEST',
      description: 'A test token on devnet',
      initialBuyAmount: 0.1,
      imagePath: path.resolve(__dirname, 'test-assets', 'test-image.png'),
      telegram: '@testtoken',
      twitter: '@testtoken',
      website: 'https://test.token'
    };
    
    // Launch token
    console.log('Launching test token...');
    const result = await agent.launchToken(
      tokenParams.name,
      tokenParams.symbol,
      tokenParams.description,
      tokenParams.initialBuyAmount,
      tokenParams.imagePath,
      tokenParams.telegram,
      tokenParams.twitter,
      tokenParams.website
    );
    
    console.log('Token launch result:', result);
    
    // Verify token exists on chain
    // Add verification logic here
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await cleanupTestEnvironment();
  }
}

// Run test if called directly
if (require.main === module) {
  main();
}

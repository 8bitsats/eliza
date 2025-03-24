import { NFTService, BlockchainPlatform } from '../dist';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  try {
    console.log('Testing NFT Service connection...');
    
    // Check if SOLANA_RPC_ENDPOINT is properly formatted
    let rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT;
    console.log(`Original RPC endpoint from .env: ${rpcEndpoint}`);
    
    // Ensure it starts with http:// or https://
    if (rpcEndpoint && !rpcEndpoint.startsWith('http://') && !rpcEndpoint.startsWith('https://')) {
      console.log('RPC endpoint does not start with http:// or https://, fixing...');
      rpcEndpoint = `https://${rpcEndpoint}`;
    }
    
    // If no endpoint is provided, use a default devnet endpoint
    if (!rpcEndpoint) {
      console.log('No RPC endpoint found, using Solana devnet');
      rpcEndpoint = 'https://api.devnet.solana.com';
    }
    
    console.log(`Using RPC endpoint: ${rpcEndpoint}`);
    
    // Use Solana Keypair generation instead of a mock key
    console.log('Creating Keypair...');
    const { Keypair } = require('@solana/web3.js');
    const keypair = Keypair.generate();
    
    // Create the NFT service with explicit endpoint
    console.log('Initializing NFT service...');
    const nftService = new NFTService(
      rpcEndpoint,
      Buffer.from(keypair.secretKey).toString('base64')
    );
    
    // Test getting balance
    const balance = await nftService.getBalance(BlockchainPlatform.SOLANA);
    console.log(`Connection successful! Balance: ${balance} SOL`);
    
  } catch (error) {
    console.error('Error testing connection:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

main();

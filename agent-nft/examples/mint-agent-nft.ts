import { AgentNFTService } from '../src';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['NVIDIA_API_KEY', 'SOLANA_RPC_ENDPOINT', 'WALLET_PRIVATE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is required`);
    process.exit(1);
  }
}

// Sample character data (replace with actual character.json content)
const characterData = {
  name: 'Eliza Agent',
  role: 'Virtual Assistant',
  capabilities: [
    'Natural language processing',
    'Task automation',
    'Knowledge retrieval'
  ],
  personality: {
    traits: [
      'helpful',
      'intelligent',
      'creative'
    ],
    communication_style: 'friendly'
  },
  appearance: {
    avatar: 'default_avatar.png'
  }
};

async function mintAgentNFT() {
  console.log('Initializing Agent NFT Service...');
  
  // Initialize the service
  const agentNftService = new AgentNFTService();
  
  // Set up environment variables
  process.env.NVIDIA_API_KEY = process.env.NVIDIA_API_KEY!;
  process.env.SOLANA_RPC_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT!;
  process.env.WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;
  
  // Check wallet balance
  const balance = await agentNftService.getWalletBalance();
  console.log(`Wallet balance: ${balance} SOL`);
  
  if (balance < 0.05) {
    console.warn('Warning: Low wallet balance. Minting an NFT requires SOL for transaction fees.');
    // Continue anyway for demonstration purposes
  }
  
  console.log('Generating DNA and minting NFT for agent...');
  
  // Generate DNA and mint NFT
  const result = await agentNftService.generateAndMintAgentNFT({
    agentName: characterData.name,
    agentDescription: `A ${characterData.personality.traits.join(', ')} ${characterData.role}`,
    agentTraits: characterData.personality.traits,
    characterData: characterData,
    visualizationStyle: 'helix',
    dnaOptions: {
      temperature: 0.7,
      maxTokens: 200,
      topK: 40
    }
  });

  if (result.nftAddress) {
    console.log('Successfully generated and minted Agent NFT:');
    console.log('- DNA Sequence:', result.dna.sequence);
    console.log('- NFT Address:', result.nftAddress);
    console.log('- Image URL:', result.imageUrl);
  } else {
    console.error('Failed to generate and mint Agent NFT');
  }
}

// Run the example
mintAgentNFT().catch(err => {
  console.error('Error in mint-agent-nft example:', err);
});

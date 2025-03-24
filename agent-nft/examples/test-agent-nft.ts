import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AgentNFTController } from '../dist';
import { BlockchainPlatform } from '../dist';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  try {
    console.log('🧬 Initializing Agent NFT Controller...');
    const controller = new AgentNFTController();

    // Load sample agent data
    const sampleAgentPath = path.join(__dirname, 'sample-agent.json');
    console.log(`📄 Loading agent data from ${sampleAgentPath}`);
    const agentData = JSON.parse(fs.readFileSync(sampleAgentPath, 'utf8'));

    console.log(`🧪 Creating NFT for agent: ${agentData.name}`);
    console.log('This process includes:');
    console.log('1. Generating unique DNA sequence');
    console.log('2. Creating a custom image');
    console.log('3. Minting an NFT');

    // Create a directory for the agent
    const outputDir = path.join(__dirname, '..', 'output', `agent-${Date.now()}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create the NFT - pass SOLANA as platform explicitly
    const result = await controller.createAgentNFT(agentData, outputDir, BlockchainPlatform.SOLANA);

    console.log('\n✅ NFT Successfully Created!');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error creating Agent NFT:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

main();

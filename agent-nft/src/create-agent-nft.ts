#!/usr/bin/env ts-node

import { AgentNFTController, AgentCharacterData } from './agent-nft-controller';
import { BlockchainPlatform } from './nft-service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let characterPath = '';
  let platform = BlockchainPlatform.SOLANA;

  // Process arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--character' && i + 1 < args.length) {
      characterPath = args[i + 1];
      i++;
    } else if (args[i] === '--platform' && i + 1 < args.length) {
      const platformArg = args[i + 1].toLowerCase();
      if (platformArg === 'solana') {
        platform = BlockchainPlatform.SOLANA;
      } else if (platformArg === 'bitcoin') {
        platform = BlockchainPlatform.BITCOIN;
      } else if (platformArg === 'ethereum') {
        platform = BlockchainPlatform.ETHEREUM;
      } else {
        console.error(`Unsupported platform: ${platformArg}. Using default: solana`);
      }
      i++;
    }
  }

  // Check if character.json path is provided
  if (!characterPath) {
    console.error('Error: Please provide a path to character.json with --character argument');
    console.log('Usage: ts-node create-agent-nft.ts --character ./path/to/character.json [--platform solana|bitcoin|ethereum]');
    process.exit(1);
  }

  // Check if character.json exists
  if (!fs.existsSync(characterPath)) {
    console.error(`Error: Character file not found at ${characterPath}`);
    process.exit(1);
  }

  try {
    // Load character data
    const characterData: AgentCharacterData = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
    console.log(`Loaded character: ${characterData.name}`);

    // Create NFT controller
    const controller = new AgentNFTController();

    // Get agent directory (parent directory of character.json)
    const agentDirectory = path.dirname(path.resolve(characterPath));

    // Create NFT
    console.log(`Creating agent NFT on ${platform}...`);
    const result = await controller.createAgentNFT(characterData, agentDirectory, platform);

    // Print result
    console.log('\nNFT successfully created!');
    console.log('======================================');
    console.log(`Agent: ${result.agentName}`);
    console.log(`NFT Address: ${result.nftAddress}`);
    console.log(`DNA Sequence: ${result.dnaSequence.substring(0, 20)}...`);
    console.log(`Platform: ${result.platform}`);
    console.log(`Explorer URL: ${result.explorerUrl}`);
    console.log('======================================');

    console.log('\nCharacter data updated with NFT information');
    console.log(`Updated character.json saved at: ${path.join(agentDirectory, 'character.json')}`);

  } catch (error) {
    console.error('Error creating agent NFT:', error);
    process.exit(1);
  }
}

main().catch(console.error);

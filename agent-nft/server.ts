import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Import services
import { DNAService, DNAResponse } from './src/dna-service';
import { AgentNFTController, AgentCharacterData, AgentNFTResult } from './src/agent-nft-controller';
import { BlockchainPlatform } from './src/nft-service';
import { DNAVisualizer } from './src/dna-visualizer';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create service instances
const controller = new AgentNFTController();
const dnaService = new DNAService(process.env.NVIDIA_NIM_API_KEY);
const dnaVisualizer = new DNAVisualizer();

// Define API routes

// Generate DNA sequence
app.post('/api/generate-dna', async (req, res) => {
  try {
    const { startSequence, numTokens = 32, temperature = 0.8 } = req.body;
    console.log(`Generating DNA with start sequence: ${startSequence}`);
    
    const dna = await dnaService.generateDNA({ 
      startSequence, 
      numTokens, 
      temperature,
      enableSampledProbs: true
    });
    
    res.json(dna);
  } catch (error) {
    console.error('DNA generation error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Visualize DNA
app.post('/api/visualize-dna', async (req, res) => {
  try {
    const { sequence, visualizationType = 'chart' } = req.body;
    console.log(`Visualizing DNA sequence: ${sequence.substring(0, 20)}...`);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const outputPath = path.join(tempDir, `dna-viz-${Date.now()}.png`);
    await dnaVisualizer.createVisualization(sequence, outputPath);
    
    res.sendFile(outputPath);
  } catch (error) {
    console.error('DNA visualization error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Generate agent avatar
app.post('/api/generate-avatar', async (req, res) => {
  try {
    const { characterData } = req.body;
    console.log(`Generating avatar for agent: ${characterData.name}`);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const avatarPath = await controller['generateAgentAvatar'](characterData, tempDir);
    res.sendFile(avatarPath);
  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Mint agent NFT
app.post('/api/mint-nft', async (req, res) => {
  try {
    const { characterData, platform = BlockchainPlatform.SOLANA } = req.body;
    console.log(`Minting NFT for agent: ${characterData.name} on ${platform}`);
    
    // Create agents directory if it doesn't exist
    const agentsDir = path.join(__dirname, 'agents');
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir);
    }
    
    // Create agent directory
    const agentDir = path.join(agentsDir, characterData.name.replace(/\s+/g, '-').toLowerCase());
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir);
    }
    
    // Write character data to file
    fs.writeFileSync(
      path.join(agentDir, 'character.json'),
      JSON.stringify(characterData, null, 2)
    );
    
    const result = await controller.createAgentNFT(characterData, agentDir, platform);
    res.json(result);
  } catch (error) {
    console.error('NFT minting error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Serve static assets from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

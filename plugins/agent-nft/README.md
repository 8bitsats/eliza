# Agent NFT Plugin for Eliza

This plugin enables generating unique DNA for agents and minting NFTs using NVIDIA's DNA Generator API and Metaplex. Each agent gets a unique DNA sequence that is visualized and minted as an on-chain NFT avatar.

## Features

- Generate unique DNA sequences for agents using NVIDIA's Arc Evo2-40b model
- Create visual representations of DNA with multiple visualization styles
- Mint NFTs with agent DNA and character data using Metaplex
- Update existing agent NFTs with new data or regenerated DNA
- Save all generated data locally for reference

## Installation

```bash
cd plugins/agent-nft
npm install
npm run build
```

## Required Environment Variables

```
NVIDIA_API_KEY=your_nvidia_api_key
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your_wallet_private_key
```

## Usage

### Basic Usage

```typescript
import { AgentNFTService } from 'agent-nft';

// Initialize the service
const agentNftService = new AgentNFTService(
  process.env.NVIDIA_API_KEY,
  process.env.SOLANA_RPC_ENDPOINT,
  process.env.WALLET_PRIVATE_KEY
);

// Generate DNA and mint an NFT for an agent
const result = await agentNftService.generateAndMintAgentNFT({
  agentName: 'Eliza Agent',
  agentDescription: 'A high-intelligence virtual assistant with unique DNA',
  agentTraits: ['intelligence', 'creativity', 'helpfulness'],
  characterData: { /* Character JSON data */ },
  visualizationStyle: 'helix',
  nftOptions: {
    symbol: 'ELIZA',
    externalUrl: 'https://eliza.app',
    royalty: 5 // 5%
  }
});

console.log(`NFT minted with address: ${result.nftResult.mintAddress}`);
```

### DNA Visualization Styles

The plugin supports multiple visualization styles for DNA sequences:

- `helix`: Classic double helix representation (default)
- `grid`: Matrix-style grid visualization
- `circular`: Circular radial visualization
- `barcode`: Linear barcode-like visualization

### Customizing DNA Generation

You can customize the DNA generation process using options:

```typescript
const result = await agentNftService.generateAndMintAgentNFT({
  // ... other options
  dnaOptions: {
    prompt: 'Generate a DNA sequence for an agent with high intelligence',
    temperature: 0.8,
    length: 300,
    topK: 40
  }
});
```

### Updating an Existing Agent NFT

```typescript
const updateResult = await agentNftService.updateAgentNFT(
  'existing_nft_address',
  {
    agentName: 'Updated Agent Name',
    agentDescription: 'Updated description',
    characterData: { /* Updated character data */ }
  },
  true // Set to true to regenerate DNA, false to keep existing DNA
);
```

## Integration with Agent Creation

To automatically mint an NFT whenever a new agent is created:

```typescript
import { AgentNFTService } from 'agent-nft';

// Agent creation process
async function createAgent(agentConfig) {
  // Create the agent using your existing process
  const agent = await yourExistingAgentCreationFunction(agentConfig);
  
  // Initialize the Agent NFT service
  const agentNftService = new AgentNFTService(
    process.env.NVIDIA_API_KEY,
    process.env.SOLANA_RPC_ENDPOINT,
    process.env.WALLET_PRIVATE_KEY
  );
  
  // Generate and mint an NFT for the agent
  const nftResult = await agentNftService.generateAndMintAgentNFT({
    agentName: agent.name,
    agentDescription: agent.description,
    agentTraits: agent.traits,
    characterData: agent.characterData,
    visualizationStyle: 'helix'
  });
  
  // Update agent with NFT information
  agent.nftAddress = nftResult.nftResult.mintAddress;
  agent.dnaSequence = nftResult.dna.sequence;
  
  return agent;
}
```

## Dependencies

- @metaplex-foundation/js
- @metaplex-foundation/mpl-token-metadata
- @solana/web3.js
- axios
- canvas
- crypto

## License

MIT

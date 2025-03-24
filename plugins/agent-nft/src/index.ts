/**
 * Agent NFT Plugin for Eliza
 * 
 * This plugin enables generating unique DNA and minting NFTs for agents
 * using NVIDIA's DNA Generator, Grok/X AI image generation, and Metaplex Core
 */

// Re-export services with explicit naming to avoid conflicts
export { DNAService, DNAResponse, DNAGenerationOptions } from './dna-service';
export { DNAVisualizer, DNAVisualizationOptions } from './dna-visualizer';
export { ImageGenerationService } from './image-generation-service';
export { MetaplexCoreService } from './metaplex-core-service';
export { AgentNFTService } from './agent-nft-service';

// Export NFT service and controller
export { 
  NFTService, 
  NFTMetadata as NFTServiceMetadata,
  NFTMintResult, 
  BlockchainPlatform, 
  MintOptions, 
  CollectionOptions,
  ExtendedDNAResponse
} from './nft-service';

export { 
  AgentNFTController, 
  AgentCharacterData, 
  AgentNFTResult 
} from './agent-nft-controller';

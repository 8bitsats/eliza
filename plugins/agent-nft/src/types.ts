import { PublicKey } from '@solana/web3.js';

export interface DNAGenerationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
}

export interface AgentDNAMetadata {
  name: string;
  description: string;
  symbol: string;
  attributes: {
    intelligence: number;
    adaptability: number;
    creativity: number;
    resilience: number;
    specialization: string[];
    traits: string[];
  };
  dnaSequence: string;
  generation: number;
  parentDNA?: string;
  evolutionHistory: string[];
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  animation_url?: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
  collection: {
    name: string;
    family: string;
  };
  uri: string;
}

export interface BitcoinInscriptionMetadata {
  dnaSequence: string;
  nftMint: string;
  timestamp: number;
  network: 'mainnet' | 'testnet';
  inscriptionId: string;
  contentType: string;
  contentHash: string;
}

export interface DNAVisualizationOptions {
  width: number;
  height: number;
  style: 'barcode' | 'radial' | 'matrix' | 'helix';
  colorScheme?: {
    A: string;
    T: string;
    G: string;
    C: string;
    background?: string;
  };
  animation?: {
    enabled: boolean;
    duration: number;
    type: 'rotate' | 'pulse' | 'wave';
  };
}

export interface AgentDNAProgram {
  registerDNA(
    dnaSequence: string,
    metadata: AgentDNAMetadata,
    nftMint: PublicKey
  ): Promise<string>;
  
  verifyDNA(
    dnaSequence: string,
    nftMint: PublicKey
  ): Promise<boolean>;
  
  evolveDNA(
    currentDNA: string,
    evolutionParams: any,
    nftMint: PublicKey
  ): Promise<string>;
  
  getDNAHistory(
    nftMint: PublicKey
  ): Promise<string[]>;
}

/**
 * DNA visualization style options
 */
export type DNAVisualizationStyle = 'helix' | 'grid' | 'circular' | 'barcode';

/**
 * Options for DNA generation
 */
export interface DNAGenerationOptions {
  /**
   * Text prompt to guide the DNA generation
   */
  prompt: string;
  
  /**
   * Temperature parameter for generation (controls randomness)
   * Higher values = more random output
   * Default: 0.8
   */
  temperature?: number;
  
  /**
   * Length of the DNA sequence to generate
   * Default: 300
   */
  length?: number;
  
  /**
   * Top-k sampling parameter
   * Default: 40
   */
  topK?: number;
  
  /**
   * DNA visualization style
   * Default: 'helix'
   */
  visualizationStyle?: DNAVisualizationStyle;
}

/**
 * Metadata for NFT
 */
export interface NFTMetadata {
  /**
   * Name of the NFT
   */
  name: string;
  
  /**
   * Description of the NFT
   */
  description: string;
  
  /**
   * URL to the image for the NFT
   */
  image: string;
  
  /**
   * External URL for the NFT
   */
  external_url?: string;
  
  /**
   * Array of attributes for the NFT
   */
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

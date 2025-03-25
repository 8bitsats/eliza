/**
 * DNA Service - Handles DNA generation and visualization API calls
 */

// Types for DNA generation options
export interface DNAGenerationOptions {
  /** Number of tokens to generate */
  numTokens?: number;
  /** Temperature for generation (0.0-1.0) */
  temperature?: number;
  /** Top-k for sampling (higher = more diversity) */
  topK?: number;
  /** Enable sampled probabilities */
  enableSampledProbs?: boolean;
  /** Starting sequence for the DNA generation */
  startSequence?: string;
  /** Visualization style for the DNA */
  visualizationStyle?: string;
  /** Model to use for generation */
  model?: string;
  /** Prompt for generation */
  prompt?: string;
  /** Width of the visualization */
  width?: number;
  /** Height of the visualization */
  height?: number;
  /** Number of steps for generation */
  steps?: number;
  /** Random seed for generation */
  seed?: number;
}

// Types for DNA response
export interface DNAResponse {
  /** The generated DNA sequence */
  sequence: string;
  /** Probabilities for each nucleotide (if available) */
  probabilities?: number[];
  /** Starting sequence for the DNA generation */
  startSequence: string;
  /** Hash of the DNA sequence (unique identifier) */
  hash: string;
}

// Types for DNA visualization
export interface DNAVisualizationOptions {
  /** Width of the output image */
  width?: number;
  /** Height of the output image */
  height?: number;
  /** Background color of the image */
  backgroundColor?: string;
  /** Visual style for DNA representation */
  style?: 'helix' | 'grid' | 'circular' | 'barcode';
  /** Optional seed value for deterministic rendering */
  seed?: number;
}

// Generate DNA sequence
export const generateDNA = async (options: DNAGenerationOptions = {}) => {
  try {
    const response = await fetch('/api/dna/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating DNA:', error);
    return {
      success: false,
      message: 'Failed to connect to DNA service',
    };
  }
};

// Generate DNA visualization
export const generateDNAVisualization = async (sequence: string, style: string = 'helix') => {
  try {
    const response = await fetch('/api/dna/visualize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sequence,
        style,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating DNA visualization:', error);
    return {
      success: false,
      message: 'Failed to connect to DNA visualization service',
    };
  }
};

// Analyze DNA sequence
export const analyzeDNA = async (sequence: string) => {
  try {
    const response = await fetch('/api/dna/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error analyzing DNA:', error);
    return {
      success: false,
      message: 'Failed to connect to DNA analysis service',
    };
  }
};

// DNA service API
export const dnaService = {
  generateDNA,
  generateDNAVisualization,
  analyzeDNA,
};

export default dnaService;

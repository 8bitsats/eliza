import axios from 'axios';
import * as crypto from 'crypto';

/**
 * Options for DNA generation
 */
export interface DNAGenerationOptions {
  /** Temperature for generation (0.0-1.0) */
  temperature: number;
  /** Maximum number of tokens to generate */
  maxTokens: number;
  /** Top-k for sampling (higher = more diversity) */
  topK: number;
  /** Starting sequence for the DNA generation */
  startSequence?: string;
}

/**
 * Result of DNA generation
 */
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

/**
 * Service for generating DNA sequences using NVIDIA's Evo 2-40b biological foundation model
 * 
 * Evo 2-40b is a state-of-the-art biological foundation model that:
 * - Contains 40 billion parameters, making it the largest AI model for biology to date
 * - Can integrate information over long genomic sequences while maintaining sensitivity to single-nucleotide changes
 * - Understands the genetic code for all domains of life
 * - Was trained on a dataset of nearly 9 trillion nucleotides
 */
export class DNAService {
  private apiKey: string;
  private apiEndpoint: string;
  private maxRetries: number;
  private retryDelay: number;
  private timeout: number;

  /**
   * Create a new DNA Service
   * @param apiKey NVIDIA API Key
   */
  constructor(apiKey?: string) {
    // Use new environment variables with fallbacks
    this.apiKey = apiKey || 
      process.env.NVIDIA_NIM_API_KEY || 
      process.env.NVIDIA_API_KEY || 
      '';
    
    this.apiEndpoint = process.env.NVIDIA_NIM_BASE_URL || 
      'https://health.api.nvidia.com/v1/biology/arc/evo2-40b/generate';
    
    this.maxRetries = Number(process.env.NVIDIA_NIM_MAX_RETRIES || '3');
    this.retryDelay = Number(process.env.NVIDIA_NIM_RETRY_DELAY || '1000');
    this.timeout = Number(process.env.NVIDIA_NIM_TIMEOUT || '5000');

    if (!this.apiKey) {
      console.warn('No NVIDIA API key provided. Using mock DNA generator.');
    }
  }

  /**
   * Generate a DNA sequence using the NVIDIA API
   * @param options Options for DNA generation
   * @returns Promise resolving to the generated DNA sequence and metadata
   */
  async generateDNA(options: DNAGenerationOptions = { temperature: 0.8, maxTokens: 8, topK: 1 }): Promise<DNAResponse> {
    const {
      temperature,
      maxTokens,
      topK,
      startSequence = 'ACTGACTGACTGACTG'
    } = options;

    try {
      if (!this.apiKey) {
        return this.generateMockDNA(options);
      }

      let retries = 0;
      let lastError: Error | null = null;

      while (retries < this.maxRetries) {
        try {
          console.log(`Calling NVIDIA DNA API with sequence: ${startSequence}, tokens: ${maxTokens}`);
          
          const response = await axios.post(
            this.apiEndpoint,
            {
              sequence: startSequence,
              num_tokens: maxTokens,
              temperature,
              top_k: topK,
              enable_sampled_probs: true
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'nvcf-poll-seconds': '300'
              },
              timeout: this.timeout
            }
          );

          const generatedSequence = response.data.generated_sequence;
          const probsArray = response.data.prob_per_gene || [];
          
          // Combine start sequence with generated sequence
          const fullSequence = startSequence + generatedSequence;
          
          // Generate hash of the sequence
          const hash = crypto.createHash('sha256').update(fullSequence).digest('hex');

          return {
            sequence: fullSequence,
            probabilities: probsArray,
            startSequence,
            hash
          };
        } catch (error) {
          lastError = error as Error;
          retries++;
          
          console.warn(`NVIDIA API call failed (attempt ${retries}/${this.maxRetries}):`, error);
          
          if (retries < this.maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          }
        }
      }

      console.error('All retry attempts failed, falling back to mock DNA generator');
      return this.generateMockDNA(options);
    } catch (error) {
      console.error('Error generating DNA:', error);
      return this.generateMockDNA(options);
    }
  }

  /**
   * Generate a mock DNA sequence for testing or when API is unavailable
   * @param options Options for DNA generation
   * @returns Mock DNA sequence and metadata
   */
  private generateMockDNA(options: DNAGenerationOptions = { temperature: 0.8, maxTokens: 8, topK: 1 }): DNAResponse {
    const {
      maxTokens,
      startSequence = 'ACTGACTGACTGACTG'
    } = options;

    const bases = ['A', 'C', 'T', 'G'];
    let sequence = startSequence;
    let probabilities: number[] = [];

    // Generate random DNA sequence
    for (let i = 0; i < maxTokens; i++) {
      const randomIndex = Math.floor(Math.random() * bases.length);
      sequence += bases[randomIndex];
      
      // Generate random probability
      probabilities.push(Math.random());
    }

    // Generate hash of the sequence
    const hash = crypto.createHash('sha256').update(sequence).digest('hex');

    return {
      sequence,
      probabilities,
      startSequence,
      hash
    };
  }

  /**
   * Calculate properties of a DNA sequence
   * @param dna The DNA sequence to analyze
   * @returns Properties of the DNA sequence
   */
  analyzeDNA(dna: string): Record<string, number> {
    const countBases = (sequence: string): Record<string, number> => {
      const counts: Record<string, number> = {
        A: 0, C: 0, G: 0, T: 0
      };
      
      for (const base of sequence) {
        if (base in counts) {
          counts[base]++;
        }
      }
      
      return counts;
    };

    const baseCounts = countBases(dna);
    const totalBases = dna.length;
    
    // Calculate percentages
    const properties: Record<string, number> = {};
    for (const [base, count] of Object.entries(baseCounts)) {
      properties[`${base}Percentage`] = parseFloat(((count / totalBases) * 100).toFixed(2));
    }

    // Calculate GC content
    properties.gcContent = parseFloat(((baseCounts.G + baseCounts.C) / totalBases * 100).toFixed(2));
    
    return properties;
  }
}

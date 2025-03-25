import { Nucleotide } from '../components/dna-generator/dna-visualizer';

interface DNAGenerationParameters {
  temperature: number;
  top_k: number;
  top_p: number;
  max_length: number;
}

interface DNAGenerationResponse {
  success: boolean;
  sequence?: string;
  error?: string;
}

export class DNAGeneratorService {
  private static readonly API_URL = 'https://api.nvidia.com/health/v1/dna/generate';

  static async generateDNA({
    sequence,
    parameters
  }: {
    sequence: string;
    parameters: DNAGenerationParameters;
  }): Promise<DNAGenerationResponse> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
        },
        body: JSON.stringify({
          prompt: sequence,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate the response
      if (!data.sequence || !isValidDNA(data.sequence)) {
        return {
          success: false,
          error: 'Invalid DNA sequence generated'
        };
      }

      return {
        success: true,
        sequence: data.sequence
      };
    } catch (error) {
      console.error('Error generating DNA:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate DNA sequence'
      };
    }
  }
}

// Validation function for DNA sequence
const isValidDNA = (sequence: string): boolean => {
  if (!sequence) return false;
  const validNucleotides = new Set(Object.values(Nucleotide));
  return sequence.toUpperCase().split("").every(char => validNucleotides.has(char as Nucleotide));
};

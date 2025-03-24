import axios from 'axios';

/**
 * Parameters for AI art generation with the fal.ai API
 */
export interface FalArtGenerationOptions {
  dnaSequence: string;
  prompt?: string;
  model?: string;
  style?: 'abstract' | 'digital' | 'realistic' | 'cinematic' | 'anime' | 'illustrated' | 'cyberpunk';
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

/**
 * Response from the art generation API
 */
interface ArtGenerationResponse {
  success: boolean;
  imageUrl?: string;
  message?: string;
  metadata?: {
    prompt: string;
    model: string;
    seed: number;
    timestamp: string;
  };
}

/**
 * Service for generating AI art based on DNA sequences
 */
class FalArtService {
  /**
   * Base URL for API requests
   */
  private apiBaseUrl = '/api/fal';

  /**
   * Generate DNA-based art from the given sequence and parameters
   */
  async generateArt(options: FalArtGenerationOptions): Promise<ArtGenerationResponse> {
    try {
      // Create a prompt if not provided
      if (!options.prompt) {
        options.prompt = this.createPromptFromDNA(options.dnaSequence, options.style);
      }

      // Make request to our server, which will forward to fal.ai
      const response = await axios.post(`${this.apiBaseUrl}/generate-art`, {
        prompt: options.prompt,
        model: options.model || 'fast-sdxl',
        width: options.width || 768,
        height: options.height || 768,
        steps: options.steps || 30,
        seed: options.seed,
        style: options.style || 'abstract'
      });

      return response.data;
    } catch (error) {
      console.error('Error generating art:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Failed to generate art'
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create an art prompt based on DNA sequence properties
   */
  createPromptFromDNA(dnaSequence: string, style: string = 'abstract'): string {
    // Extract DNA sequence properties
    const gcContent = this.calculateGCContent(dnaSequence);
    const atRatio = this.calculateATRatio(dnaSequence);
    const repeats = this.findRepeats(dnaSequence);
    
    // Generate base prompt
    let basePrompt = '';
    
    // Color temperature based on GC content (GC rich = cooler colors)
    if (gcContent > 0.6) {
      basePrompt += 'cool blue and purple tones, ';
    } else if (gcContent < 0.4) {
      basePrompt += 'warm red and orange tones, ';
    } else {
      basePrompt += 'balanced color palette, ';
    }
    
    // Mood based on AT ratio
    if (atRatio > 1.5) {
      basePrompt += 'flowing, organic, natural patterns, ';
    } else if (atRatio < 0.5) {
      basePrompt += 'structured, geometric, crystalline patterns, ';
    } else {
      basePrompt += 'balanced mix of organic and geometric elements, ';
    }
    
    // Complexity based on sequence length
    if (dnaSequence.length > 50) {
      basePrompt += 'highly detailed and complex, ';
    } else {
      basePrompt += 'elegant and minimal, ';
    }
    
    // Rhythmic elements based on repeats
    if (repeats > 3) {
      basePrompt += 'rhythmic repeating patterns, ';
    }
    
    // Style-specific prompts
    let stylePrompt = '';
    switch (style) {
      case 'abstract':
        stylePrompt = 'abstract art with fluid forms and dynamic composition';
        break;
      case 'digital':
        stylePrompt = 'digital art with glowing elements and futuristic aesthetic';
        break;
      case 'realistic':
        stylePrompt = 'photorealistic natural landscape with organic elements';
        break;
      case 'cinematic':
        stylePrompt = 'cinematic scene with dramatic lighting and atmosphere';
        break;
      case 'anime':
        stylePrompt = 'anime style illustration with vibrant colors';
        break;
      case 'illustrated':
        stylePrompt = 'detailed illustration with fine linework and rich textures';
        break;
      case 'cyberpunk':
        stylePrompt = 'cyberpunk cityscape with neon lights and futuristic technology';
        break;
      default:
        stylePrompt = 'abstract art composition';
    }
    
    // Create DNA hash text to include
    const dnaShortHash = this.createHashFromDNA(dnaSequence);
    
    // Final prompt
    return `${basePrompt} ${stylePrompt}, inspired by DNA sequence. [DNA: ${dnaShortHash}], professional digital artwork, trending on artstation, award-winning, highly detailed`;
  }
  
  /**
   * Calculate GC content (proportion of G and C bases)
   */
  private calculateGCContent(sequence: string): number {
    const gc = (sequence.match(/[GC]/gi) || []).length;
    return gc / sequence.length;
  }
  
  /**
   * Calculate ratio of A to T bases
   */
  private calculateATRatio(sequence: string): number {
    const a = (sequence.match(/A/gi) || []).length;
    const t = (sequence.match(/T/gi) || []).length;
    return t > 0 ? a / t : a;
  }
  
  /**
   * Find number of repeating patterns (3+ bases)
   */
  private findRepeats(sequence: string): number {
    let count = 0;
    for (let i = 0; i < sequence.length - 2; i++) {
      if (sequence[i] === sequence[i+1] && sequence[i] === sequence[i+2]) {
        count++;
        i += 2; // Skip the repeated bases
      }
    }
    return count;
  }
  
  /**
   * Create a short hash representation of the DNA sequence
   */
  private createHashFromDNA(sequence: string): string {
    // Just take first 8 chars
    return sequence.substring(0, 8);
  }
}

export const falArtService = new FalArtService();

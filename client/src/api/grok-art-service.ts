import axios from 'axios';

export interface GrokImageGenerationOptions {
  model: string;
  prompt: string;
  size?: string;
  n?: number;
  response_format?: 'url' | 'b64_json';
}

export interface GrokImageResponse {
  imageUrl?: string;
  b64Json?: string;
  revisedPrompt?: string;
  additionalImages?: string[];
}

/**
 * Service for interacting with the Grok image generation API
 */
class GrokArtService {
  private readonly baseUrl = 'https://api.x.ai/v1';
  private apiKey: string | null = null;

  constructor() {
    // Try to load API key from .env
    this.apiKey = import.meta.env.VITE_XAI_API_KEY || import.meta.env.VITE_GROK_API_KEY || null;
  }

  /**
   * Set the API key for Grok
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate an image using Grok
   */
  async generateImage(options: GrokImageGenerationOptions): Promise<GrokImageResponse> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please set your Grok API key first.');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: options.model || 'grok-2-image',
          prompt: options.prompt,
          n: options.n || 1,
          size: options.size || '1024x1024',
          response_format: options.response_format || 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.data || !response.data.data[0]) {
        throw new Error('Invalid response from Grok API');
      }

      const result: GrokImageResponse = {
        imageUrl: response.data.data[0].url,
        b64Json: response.data.data[0].b64_json,
        revisedPrompt: response.data.data[0].revised_prompt
      };

      // Add additional images if more than one was generated
      if (response.data.data.length > 1) {
        result.additionalImages = response.data.data
          .slice(1)
          .map((img: any) => img.url);
      }

      return result;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Grok API error: ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw error;
    }
  }
}

// Create and export singleton instance
const grokArtService = new GrokArtService();
export default grokArtService;

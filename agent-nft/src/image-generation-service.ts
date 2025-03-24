import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ImageGenerationOptions {
  prompt?: string;
  n?: number;
  responseFormat?: 'url' | 'b64_json';
  character?: any; // Character JSON data
  dnaSequence?: string;
  style?: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  url?: string;
  base64Data?: string;
  imageHash: string;
}

export class ImageGenerationService {
  private apiKey: string;
  private baseURL: string = 'https://api.x.ai/v1';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.X_AI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('No X AI API key provided. Image generation will not work.');
    }
  }

  /**
   * Generate an image prompt based on character data
   */
  private generatePromptFromCharacter(character: any): string {
    // Extract relevant information from character.json
    const name = character.name || 'Agent';
    const bio = Array.isArray(character.bio) ? character.bio.join(' ') : character.bio || '';
    const adjectives = Array.isArray(character.adjectives) ? character.adjectives.slice(0, 5).join(', ') : '';
    
    // Create a detailed prompt for Grok-2-image
    return `Create a visually striking avatar for an AI agent named ${name}. 
      This character is ${adjectives}. 
      ${bio}
      The image should be high resolution, detailed, with vibrant colors, and have a futuristic tech aesthetic 
      with elements suggesting advanced AI, blockchain technology, and digital identity. 
      Include subtle references to cryptocurrency, NFTs, and blockchain networks.`;
  }

  /**
   * Generate an image using Grok-2-image model
   */
  async generateImage(options: ImageGenerationOptions = {}): Promise<ImageGenerationResult> {
    try {
      if (!this.apiKey) {
        throw new Error('No X AI API key provided');
      }

      let prompt = options.prompt;
      
      // If character data is provided and no prompt, generate one from character
      if (!prompt && options.character) {
        prompt = this.generatePromptFromCharacter(options.character);
      }
      
      if (!prompt) {
        throw new Error('No prompt or character data provided for image generation');
      }

      const response = await axios.post(
        `${this.baseURL}/images/generations`,
        {
          model: 'grok-2-image',
          prompt,
          n: options.n || 1,
          response_format: options.responseFormat || 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const imageData = response.data.data[0];
      const revisedPrompt = imageData.revised_prompt;
      console.log('Revised prompt:', revisedPrompt);

      // Generate a hash of the image data for reference
      const imageContent = options.responseFormat === 'b64_json' 
        ? imageData.b64_json 
        : await this.downloadImage(imageData.url);
      
      const imageHash = crypto.createHash('sha256').update(imageContent).digest('hex');

      return {
        url: options.responseFormat === 'url' ? imageData.url : undefined,
        base64Data: options.responseFormat === 'b64_json' ? imageData.b64_json : undefined,
        imageHash
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Download an image from a URL and return it as base64
   */
  private async downloadImage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary').toString('base64');
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Save a base64 image to disk
   */
  async saveImageToDisk(base64Data: string, fileName: string, outputDir: string = 'output'): Promise<string> {
    try {
      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Remove 'data:image/jpeg;base64,' if present
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // Create buffer from base64
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Generate file path
      const filePath = path.join(outputDir, fileName);
      
      // Write image to disk
      fs.writeFileSync(filePath, imageBuffer);
      
      return filePath;
    } catch (error) {
      console.error('Error saving image to disk:', error);
      throw error;
    }
  }
}

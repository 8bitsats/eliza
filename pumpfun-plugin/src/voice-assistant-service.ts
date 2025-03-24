import { tokenLauncherService } from './token-launcher-service';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Deepgram } from '@deepgram/sdk';
import OpenAI from 'openai';
import { LiveKit } from '@livekit/server-sdk';

// Configuration paths
const CONFIG_DIR = path.join(os.homedir(), '.config', 'eliza', 'pumpfun');
const VOICE_CONFIG_FILE = path.join(CONFIG_DIR, 'voice-config.json');

// Default configuration
const DEFAULT_VOICE_CONFIG = {
  enabled: false,
  apiKeys: {
    deepgram: '',
    openai: '',
    livekit: ''
  },
  voice: 'nova',
  conversationHistory: []
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface VoiceConfig {
  enabled: boolean;
  apiKeys: {
    deepgram: string;
    openai: string;
    livekit: string;
  };
  voice: string;
  conversationHistory: Message[];
}

interface TokenInfo {
  name: string;
  symbol: string;
  description?: string;
  initialBuyAmount?: number;
  image?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
  network?: string;
}

/**
 * Voice Assistant Service for Token Launcher
 * Integrates with Deepgram for real-time speech recognition,
 * OpenAI for processing transcribed speech, and LiveKit for audio streaming
 */
export class VoiceAssistantService {
  private config: VoiceConfig;
  private deepgram: Deepgram | null = null;
  private openai: OpenAI | null = null;
  private livekit: any = null; // Using any as type since LiveKit types might not be available
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private audioStream: any = null;
  
  constructor() {
    // Ensure config directory exists
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    // Initialize or load configuration
    if (!fs.existsSync(VOICE_CONFIG_FILE)) {
      this.config = DEFAULT_VOICE_CONFIG;
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } else {
      this.config = JSON.parse(fs.readFileSync(VOICE_CONFIG_FILE, 'utf-8'));
    }
    
    // Initialize services if enabled and API keys are provided
    this.initializeServices();
  }
  
  /**
   * Initialize Deepgram, OpenAI, and LiveKit services
   */
  private initializeServices(): void {
    if (!this.config.enabled) return;
    
    if (this.config.apiKeys.deepgram) {
      this.deepgram = new Deepgram(this.config.apiKeys.deepgram);
    }
    
    if (this.config.apiKeys.openai) {
      this.openai = new OpenAI({
        apiKey: this.config.apiKeys.openai
      });
    }
    
    if (this.config.apiKeys.livekit) {
      this.livekit = { apiKey: this.config.apiKeys.livekit }; // LiveKit initialization placeholder
    }
  }
  
  /**
   * Enable or disable the voice assistant
   */
  async setEnabled(enabled: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      this.config.enabled = enabled;
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      
      if (enabled) {
        this.initializeServices();
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Configure API keys for the voice services
   */
  async configureApiKeys(apiKeys: { deepgram?: string; openai?: string; livekit?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      this.config.apiKeys = {
        ...this.config.apiKeys,
        ...apiKeys
      };
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      this.initializeServices();
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Change the voice used for text-to-speech
   */
  async setVoice(voice: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.config.voice = voice;
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Start listening for voice commands
   */
  async startListening(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.enabled) {
      return { success: false, error: 'Voice assistant is not enabled' };
    }
    
    if (!this.deepgram) {
      return { success: false, error: 'Deepgram API key not configured' };
    }
    
    try {
      this.isListening = true;
      // Implementation would connect to the microphone and start streaming audio to Deepgram
      // This is a placeholder for the actual implementation
      
      return { success: true };
    } catch (error) {
      this.isListening = false;
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Stop listening for voice commands
   */
  async stopListening(): Promise<{ success: boolean; error?: string }> {
    try {
      this.isListening = false;
      // Implementation would disconnect from the microphone and stop streaming audio
      // This is a placeholder for the actual implementation
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Process a voice command
   */
  async processVoiceCommand(transcript: string): Promise<{ success: boolean; response: string; error?: string }> {
    if (!this.config.enabled) {
      return { success: false, response: '', error: 'Voice assistant is not enabled' };
    }
    
    if (!this.openai) {
      return { success: false, response: '', error: 'OpenAI API key not configured' };
    }
    
    try {
      // Add user message to conversation history
      this.config.conversationHistory.push({
        role: 'user',
        content: transcript
      });
      
      // Prepare messages for OpenAI API
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that helps users launch tokens on the Solana blockchain. You can extract token information from user requests.'
        },
        ...this.config.conversationHistory
      ];
      
      // Get response from OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: messages as any[],
        max_tokens: 150
      });
      
      const response = completion.choices[0].message.content || 'I\'m sorry, I couldn\'t generate a response.';
      
      // Add assistant response to conversation history
      this.config.conversationHistory.push({
        role: 'assistant',
        content: response
      });
      
      // Save conversation history
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      
      // Check if the command is to launch a token
      const tokenInfo = this.extractTokenInfoFromTranscript(transcript);
      if (tokenInfo) {
        await this.launchToken(tokenInfo);
      }
      
      return { success: true, response };
    } catch (error) {
      return { 
        success: false, 
        response: 'I encountered an error processing your request.', 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Extract token information from a transcript
   */
  private extractTokenInfoFromTranscript(transcript: string): TokenInfo | null {
    // Simple extraction logic - in a real implementation this would be more sophisticated
    // and would likely use the OpenAI API to extract structured data from the transcript
    const nameMatch = transcript.match(/token name(?:\s+is)?(?:\s+called)?\s+([\w\s]+)/i);
    const symbolMatch = transcript.match(/token symbol(?:\s+is)?\s+([\w]+)/i);
    const descriptionMatch = transcript.match(/token description(?:\s+is)?\s+([^.]+)/i);
    const amountMatch = transcript.match(/(?:buy|purchase|invest)\s+([\d.]+)\s+(?:sol|solana)/i);
    const networkMatch = transcript.match(/(?:on|using)\s+(mainnet|devnet)/i);
    
    if (nameMatch && symbolMatch) {
      return {
        name: nameMatch[1].trim(),
        symbol: symbolMatch[1].trim().toUpperCase(),
        description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
        initialBuyAmount: amountMatch ? parseFloat(amountMatch[1]) : 0.1,
        network: networkMatch ? networkMatch[1].toLowerCase() : 'devnet'
      };
    }
    
    return null;
  }
  
  /**
   * Launch a token based on voice command information
   */
  private async launchToken(tokenInfo: TokenInfo): Promise<void> {
    try {
      const generatedImagePath = await this.generateTokenImage(tokenInfo.name, tokenInfo.symbol);
      
      // Launch the token
      const result = await tokenLauncherService.launchToken({
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        description: tokenInfo.description || `${tokenInfo.name} token created via voice command`,
        initialBuyAmount: tokenInfo.initialBuyAmount || 0.1,
        image: generatedImagePath,
        imageName: `${tokenInfo.symbol.toLowerCase()}_logo.png`,
        telegram: tokenInfo.telegram,
        twitter: tokenInfo.twitter,
        website: tokenInfo.website,
        retry: true,
        generateViaAgent: true
      });
      
      if (result.success) {
        // Add the successful launch to conversation history
        this.config.conversationHistory.push({
          role: 'system',
          content: `Token ${tokenInfo.name} (${tokenInfo.symbol}) has been successfully launched at address ${result.tokenAddress}`
        });
      } else {
        // Add the failed launch to conversation history
        this.config.conversationHistory.push({
          role: 'system',
          content: `Failed to launch token: ${result.error}`
        });
      }
      
      // Save conversation history
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error launching token:', error);
    }
  }
  
  /**
   * Generate a token image based on the token name and symbol
   * In a real implementation, this would use an image generation API
   */
  private async generateTokenImage(name: string, symbol: string): Promise<string> {
    // For now, just create a placeholder image
    const imagePath = path.join(CONFIG_DIR, `${symbol.toLowerCase()}_logo.png`);
    
    // Simple placeholder image (a colored circle)
    // In a real implementation, we would use the OpenAI DALL-E API or another image generation service
    const svgContent = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <circle cx="256" cy="256" r="250" fill="#${Math.floor(Math.random() * 16777215).toString(16)}" />
      <text x="256" y="256" font-family="Arial" font-size="120" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">
        ${symbol.substring(0, 3)}
      </text>
    </svg>`;
    
    // Write SVG to file
    fs.writeFileSync(imagePath, svgContent, 'utf-8');
    
    return imagePath;
  }
  
  /**
   * Convert text to speech using OpenAI TTS
   */
  async textToSpeech(text: string): Promise<{ success: boolean; audioPath?: string; error?: string }> {
    if (!this.config.enabled) {
      return { success: false, error: 'Voice assistant is not enabled' };
    }
    
    if (!this.openai) {
      return { success: false, error: 'OpenAI API key not configured' };
    }
    
    try {
      const audioPath = path.join(CONFIG_DIR, `response_${Date.now()}.mp3`);
      
      // Get speech from OpenAI
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: this.config.voice,
        input: text
      });
      
      // Convert to Buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      // Save to file
      fs.writeFileSync(audioPath, buffer);
      
      return { success: true, audioPath };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Clear conversation history
   */
  async clearConversationHistory(): Promise<{ success: boolean; error?: string }> {
    try {
      this.config.conversationHistory = [];
      fs.writeFileSync(VOICE_CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Export a singleton instance
export const voiceAssistantService = new VoiceAssistantService();

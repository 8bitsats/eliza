import axios from 'axios';

/**
 * Service to interact with the Ordinals backend server
 */
export class OrdinalsService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private callbacks: {
    onMessage?: (content: string) => void;
    onStatusChange?: (status: string) => void;
    onSystemMessage?: (content: string) => void;
    onActionResult?: (result: any) => void;
  } = {};

  constructor(baseUrl: string = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set callback functions for websocket events
   */
  setCallbacks(callbacks: {
    onMessage?: (content: string) => void;
    onStatusChange?: (status: string) => void;
    onSystemMessage?: (content: string) => void;
    onActionResult?: (result: any) => void;
  }) {
    this.callbacks = callbacks;
  }

  /**
   * Connect to the Eliza Ordinals websocket server
   */
  async connect(url: string = 'ws://localhost:3002/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.callbacks.onStatusChange?.('connected');
          resolve();
          return;
        }

        this.callbacks.onStatusChange?.('connecting');
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.callbacks.onStatusChange?.('connected');
          this.callbacks.onSystemMessage?.('Connected to Ord GPT');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'message') {
              this.callbacks.onMessage?.(data.content);
            } else if (data.type === 'action_result') {
              this.callbacks.onActionResult?.(data.result);
            } else if (data.type === 'system') {
              this.callbacks.onSystemMessage?.(data.content);
            }
          } catch (err) {
            console.error('Error parsing websocket message:', err);
            this.callbacks.onSystemMessage?.(`Error parsing message: ${err}`);
          }
        };

        this.ws.onclose = () => {
          this.callbacks.onStatusChange?.('disconnected');
          this.callbacks.onSystemMessage?.('Disconnected from Ord GPT');
        };

        this.ws.onerror = (error) => {
          this.callbacks.onStatusChange?.('error');
          this.callbacks.onSystemMessage?.(`Connection error: ${error}`);
          reject(error);
        };
      } catch (error) {
        this.callbacks.onStatusChange?.('error');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the websocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message through the websocket
   */
  sendMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Ord GPT');
    }

    this.ws.send(JSON.stringify({
      type: 'message',
      content: text
    }));
  }

  /**
   * Send an action through the websocket
   */
  sendAction(action: string, params: Record<string, any> = {}): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Ord GPT');
    }

    this.ws.send(JSON.stringify({
      type: 'action',
      action,
      params
    }));
  }

  /**
   * Get API status
   */
  async getApiStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking API status:', error);
      throw error;
    }
  }

  /**
   * Get inscriptions with optional filtering
   */
  async getInscriptions(options: Record<string, any> = {}): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/inscriptions`, { params: options });
      return response.data;
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      throw error;
    }
  }

  /**
   * Get a single inscription by ID
   */
  async getInscription(id: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/inscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get inscription content by ID
   */
  async getInscriptionContent(id: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/inscriptions/${id}/content`, {
        responseType: 'arraybuffer'
      });
      
      // Convert content based on content-type
      const contentType = response.headers['content-type'];
      let content;

      if (contentType.includes('text') || contentType.includes('json')) {
        content = new TextDecoder().decode(response.data);
      } else if (contentType.includes('image')) {
        const blob = new Blob([response.data], { type: contentType });
        content = URL.createObjectURL(blob);
      } else {
        content = response.data;
      }

      return { content, contentType };
    } catch (error) {
      console.error(`Error fetching inscription content ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find rare satoshis by rarity
   */
  async findRareSatoshis(rarity: string | string[], limit: number = 10): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/satoshis/rare`, {
        params: { rarity, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error finding rare satoshis:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const ordinalsService = new OrdinalsService();
export default ordinalsService;

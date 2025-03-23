import { v4 as uuidv4 } from 'uuid';

class ElizaService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userId = `user-${uuidv4().substring(0, 8)}`;
    this.callbacks = {
      onMessage: null,
      onStatusChange: null,
      onSystemMessage: null,
      onActionResult: null,
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  /**
   * Connect to the Eliza WebSocket server
   * @param {string} url - WebSocket URL
   * @returns {Promise} - Resolves when connected, rejects on error
   */
  connect(url = 'ws://localhost:3002/ws') {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Already connected to Eliza');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange('Connecting...', 'connecting');
        }

        if (this.callbacks.onSystemMessage) {
          this.callbacks.onSystemMessage('Connecting to Ord GPT...');
        }

        this.socket = new WebSocket(url);

        this.socket.addEventListener('open', () => {
          console.log('Connected to Eliza');
          this.connected = true;
          this.reconnectAttempts = 0;

          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('Connected', 'connected');
          }

          if (this.callbacks.onSystemMessage) {
            this.callbacks.onSystemMessage('Connected to Ord GPT');
          }

          // Send initial message to wake up the agent
          this.sendMessage('Hello, I want to talk about Bitcoin Ordinals');
          resolve();
        });

        this.socket.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received:', data);

            if (data.type === 'message' && data.senderId !== this.userId) {
              if (this.callbacks.onMessage) {
                this.callbacks.onMessage(data.content);
              }
            } else if (data.type === 'action_result') {
              if (this.callbacks.onActionResult) {
                this.callbacks.onActionResult(data.result);
              }
              if (this.callbacks.onSystemMessage) {
                this.callbacks.onSystemMessage(`Action result: ${JSON.stringify(data.result)}`);
              }
            }
          } catch (error) {
            console.error('Error parsing message:', error);
            if (this.callbacks.onSystemMessage) {
              this.callbacks.onSystemMessage('Received invalid message from server');
            }
          }
        });

        this.socket.addEventListener('close', () => {
          console.log('Disconnected from Eliza');
          this.connected = false;

          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('Disconnected', 'disconnected');
          }

          if (this.callbacks.onSystemMessage) {
            this.callbacks.onSystemMessage('Connection closed');
          }

          // Try to reconnect if we haven't exceeded the maximum attempts
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts += 1;
            const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
            console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
            
            if (this.callbacks.onSystemMessage) {
              this.callbacks.onSystemMessage(`Attempting to reconnect in ${delay / 1000} seconds...`);
            }
            
            this.reconnectTimeout = setTimeout(() => {
              this.connect(url);
            }, delay);
          } else {
            console.log('Maximum reconnection attempts reached');
            if (this.callbacks.onSystemMessage) {
              this.callbacks.onSystemMessage('Maximum reconnection attempts reached. Please reconnect manually.');
            }
          }
        });

        this.socket.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);

          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('Connection error', 'error');
          }

          if (this.callbacks.onSystemMessage) {
            this.callbacks.onSystemMessage('Error connecting to Ord GPT server');
          }

          reject(error);
        });
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the Eliza WebSocket server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Send a chat message to Eliza
   * @param {string} text - Message text
   * @throws {Error} - If not connected
   */
  sendMessage(text) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Eliza server');
    }

    const message = {
      type: 'message',
      content: text,
      senderId: this.userId
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Send an action to Eliza
   * @param {string} action - Action name
   * @param {object} params - Action parameters
   * @throws {Error} - If not connected
   */
  sendAction(action, params = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Eliza server');
    }

    const actionMessage = {
      type: 'action',
      action: action,
      params: params,
      senderId: this.userId
    };

    this.socket.send(JSON.stringify(actionMessage));
  }

  /**
   * Set callbacks for events
   * @param {object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check if connected to Eliza
   * @returns {boolean} - True if connected
   */
  isConnected() {
    return this.connected;
  }
}

// Create and export a singleton instance
const elizaService = new ElizaService();
export default elizaService;

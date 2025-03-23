/**
 * Ordinals Client API Integration
 * 
 * This file integrates the Bitcoin Ordinals Indexer API client with the Ordinals Client UI.
 * It provides functions to interact with the Ordinals API for retrieving inscription data.
 */

// Import required dependencies from the API client once we add it to the project
// For now, we'll create a wrapper class that will use the fetch API

class OrdinalsClient {
    constructor(baseUrl = 'https://api.hiro.so', elizaUrl = 'ws://localhost:3002/ws') {
        this.baseUrl = baseUrl;
        this.elizaUrl = elizaUrl;
        this.isConnected = false;
        this.socket = null;
        this.userId = 'user-' + Math.random().toString(36).substring(2, 10);
        this.callbacks = {
            onMessage: null,
            onStatusChange: null,
            onSystemMessage: null
        };
    }
    
    // Connect to Eliza WebSocket
    connect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Already connected to Eliza');
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(this.elizaUrl);
                
                this.socket.addEventListener('open', () => {
                    console.log('Connected to Eliza');
                    this.isConnected = true;
                    
                    if (this.callbacks.onStatusChange) {
                        this.callbacks.onStatusChange('Connected', 'connected');
                    }
                    
                    if (this.callbacks.onSystemMessage) {
                        this.callbacks.onSystemMessage('Connected to Eliza server. You can now chat with Ord GPT.');
                    }
                    
                    // Send a simple initial message to start the conversation
                    const initialMessage = {
                        type: 'message',
                        content: 'Hello, I want to talk about Bitcoin Ordinals',
                        senderId: this.userId
                    };
                    
                    this.socket.send(JSON.stringify(initialMessage));
                    resolve();
                });
                
                this.socket.addEventListener('message', (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received from Eliza:', data);
                        
                        if (data.type === 'message' && data.senderId !== this.userId) {
                            if (this.callbacks.onMessage) {
                                this.callbacks.onMessage(data.content);
                            }
                        } else if (data.type === 'action_result') {
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
                    this.isConnected = false;
                    
                    if (this.callbacks.onStatusChange) {
                        this.callbacks.onStatusChange('Disconnected', 'disconnected');
                    }
                    
                    if (this.callbacks.onSystemMessage) {
                        this.callbacks.onSystemMessage('Connection closed. Click Connect to reconnect.');
                    }
                    
                    this.socket = null;
                });
                
                this.socket.addEventListener('error', (error) => {
                    console.error('WebSocket error:', error);
                    
                    if (this.callbacks.onStatusChange) {
                        this.callbacks.onStatusChange('Connection error', 'error');
                    }
                    
                    if (this.callbacks.onSystemMessage) {
                        this.callbacks.onSystemMessage('Error connecting to Eliza server. Make sure it is running on http://localhost:3002');
                    }
                    
                    reject(error);
                });
            } catch (error) {
                console.error('Error creating WebSocket:', error);
                reject(error);
            }
        });
    }
    
    // Disconnect from Eliza WebSocket
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }
    
    // Send a chat message to Eliza
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
    
    // Send an action to Eliza
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
    
    // Set callbacks for events
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Get API status
     */
    async getApiStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/ordinals/v1/`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching API status:', error);
            throw error;
        }
    }

    /**
     * Get a list of inscriptions with optional filtering
     */
    async getInscriptions(options = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Add pagination parameters
            if (options.limit) queryParams.append('limit', options.limit);
            if (options.offset) queryParams.append('offset', options.offset);
            
            // Add filter parameters
            if (options.from_number) queryParams.append('from_number', options.from_number);
            if (options.to_number) queryParams.append('to_number', options.to_number);
            
            if (options.mime_type && Array.isArray(options.mime_type)) {
                options.mime_type.forEach(type => queryParams.append('mime_type', type));
            }
            
            if (options.address && Array.isArray(options.address)) {
                options.address.forEach(addr => queryParams.append('address', addr));
            }
            
            // Add sorting parameters
            if (options.order_by) queryParams.append('order_by', options.order_by);
            if (options.order) queryParams.append('order', options.order);

            const url = `${this.baseUrl}/ordinals/v1/inscriptions?${queryParams.toString()}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching inscriptions:', error);
            throw error;
        }
    }

    /**
     * Get a single inscription by ID or number
     */
    async getInscription(id) {
        try {
            const response = await fetch(`${this.baseUrl}/ordinals/v1/inscriptions/${id}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching inscription ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get the content of an inscription
     * Returns a Blob that can be displayed according to its MIME type
     */
    async getInscriptionContent(id) {
        try {
            const response = await fetch(`${this.baseUrl}/ordinals/v1/inscriptions/${id}/content`);
            return await response.blob();
        } catch (error) {
            console.error(`Error fetching inscription content ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get all transfers for an inscription
     */
    async getInscriptionTransfers(id, options = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (options.limit) queryParams.append('limit', options.limit);
            if (options.offset) queryParams.append('offset', options.offset);
            
            const url = `${this.baseUrl}/ordinals/v1/inscriptions/${id}/transfers?${queryParams.toString()}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching inscription transfers ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get information about a satoshi by its ordinal number
     */
    async getSatoshi(ordinal) {
        try {
            const response = await fetch(`${this.baseUrl}/ordinals/v1/sats/${ordinal}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching satoshi ${ordinal}:`, error);
            throw error;
        }
    }

    /**
     * Find rare satoshis by rarity
     * Note: This is a custom function that would need to be implemented on the server side
     */
    async findRareSatoshis(rarity, limit = 10) {
        try {
            // In a real implementation, this would call an API endpoint that supports
            // filtering by rarity. For now, we're simulating this by getting a list of 
            // inscriptions and filtering client-side
            const inscriptions = await this.getInscriptions({
                limit: 100 // Get more than we need since we'll filter
            });
            
            // Filter inscriptions by sat_rarity
            const filtered = inscriptions.results.filter(insc => 
                insc.sat_rarity && insc.sat_rarity.toLowerCase() === rarity.toLowerCase()
            ).slice(0, limit);
            
            return {
                limit,
                offset: 0,
                total: filtered.length,
                results: filtered
            };
        } catch (error) {
            console.error(`Error finding rare satoshis with rarity ${rarity}:`, error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const ordinalsClient = new OrdinalsClient();

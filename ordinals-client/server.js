import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3002;
const ORD_PATH = process.env.ORD_PATH || '../Ord/ord-master/target/release/ord';

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// API routes for status check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    ordPath: ORD_PATH,
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints for inscriptions
app.get('/api/inscriptions', (req, res) => {
  // Generate mock inscriptions data
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  
  const inscriptions = Array.from({ length: limit }).map((_, index) => ({
    id: `${(index + offset + 1).toString(16).padStart(64, '0')}i0`,
    number: offset + index + 1,
    address: `bc1q${Math.random().toString(36).substring(2, 15)}`,
    genesis_fee: Math.floor(Math.random() * 10000) + 1000,
    genesis_height: Math.floor(Math.random() * 100000) + 700000,
    genesis_timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
    genesis_tx_id: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    output: `${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 10)}`,
    sat_ordinal: Math.floor(Math.random() * 2100000000000000),
    content_type: ['image/png', 'image/jpeg', 'text/plain', 'text/html', 'application/json'][Math.floor(Math.random() * 5)],
    content_length: Math.floor(Math.random() * 100000) + 1000,
    timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000)
  }));
  
  res.json({
    results: inscriptions,
    limit,
    offset,
    total: 10000
  });
});

app.get('/api/inscriptions/:id', (req, res) => {
  const id = req.params.id;
  
  // Generate a consistent mock inscription for a given ID
  const inscription = {
    id,
    number: parseInt(id.substring(0, 8), 16),
    address: `bc1q${Math.random().toString(36).substring(2, 15)}`,
    genesis_fee: Math.floor(Math.random() * 10000) + 1000,
    genesis_height: Math.floor(Math.random() * 100000) + 700000,
    genesis_timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000),
    genesis_tx_id: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    output: `${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 10)}`,
    sat_ordinal: Math.floor(Math.random() * 2100000000000000),
    content_type: ['image/png', 'image/jpeg', 'text/plain', 'text/html', 'application/json'][Math.floor(Math.random() * 5)],
    content_length: Math.floor(Math.random() * 100000) + 1000,
    timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000000)
  };
  
  res.json(inscription);
});

app.get('/api/inscriptions/:id/content', (req, res) => {
  const id = req.params.id;
  const contentType = ['image/png', 'image/jpeg', 'text/plain', 'text/html', 'application/json'][Math.floor(Math.random() * 5)];
  
  if (contentType === 'text/plain') {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`This is a text inscription with ID: ${id}\nGenerated as a placeholder.`);
  } else if (contentType === 'text/html') {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<html><body><h1>HTML Inscription</h1><p>ID: ${id}</p><p>This is a placeholder HTML inscription.</p></body></html>`);
  } else if (contentType === 'application/json') {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      id,
      type: 'json-inscription',
      created: new Date().toISOString(),
      properties: {
        name: `Inscription ${id}`,
        description: 'A placeholder JSON inscription',
        attributes: [
          { trait_type: 'Type', value: 'JSON' },
          { trait_type: 'Rarity', value: 'Common' }
        ]
      }
    }));
  } else {
    // For image types, serve a placeholder image or redirect to a placeholder
    res.redirect('https://placehold.co/400x400?text=Inscription');
  }
});

app.get('/api/satoshis/rare', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const rarityLevels = ['uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  
  // Generate mock rare satoshis
  const rareSatoshis = Array.from({ length: limit }).map((_, index) => {
    const rarity = rarityLevels[Math.floor(Math.random() * rarityLevels.length)];
    return {
      ordinal: 2099994106229880 - Math.floor(Math.random() * 1000000000),
      rarity,
      name: ['Alpha', 'Omega', 'First', 'Block 9', 'Pizza', 'Vintage'][Math.floor(Math.random() * 6)],
      block_height: Math.floor(Math.random() * 100000) + 700000,
      cycle: Math.floor(Math.random() * 5),
      epoch: Math.floor(Math.random() * 10),
      period: Math.floor(Math.random() * 20),
      offset: Math.floor(Math.random() * 1000),
      decimal: `${Math.floor(Math.random() * 16)}.${Math.floor(Math.random() * 16)}`
    };
  });
  
  res.json({
    results: rareSatoshis,
    count: rareSatoshis.length,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    content: 'Connected to Ord GPT WebSocket Server'
  }));
  
  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      if (data.type === 'message') {
        // Process user messages
        const response = {
          type: 'message',
          content: `Ord GPT: I received your message: "${data.content}". This is a placeholder response. The actual Ord GPT functionality will be connected to the ordinals plugin.`
        };
        
        ws.send(JSON.stringify(response));
      } else if (data.type === 'action') {
        // Process actions (e.g., find rare satoshis, get inscriptions)
        const actionResult = {
          type: 'action_result',
          action: data.action,
          result: {
            success: true,
            message: `Action '${data.action}' processed (placeholder)`,
            timestamp: new Date().toISOString(),
            // Placeholder data - real implementation would call the ordinals plugin
            data: data.params
          }
        };
        
        ws.send(JSON.stringify(actionResult));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'system',
        content: `Error processing message: ${error.message}`
      }));
    }
  });
  
  // Handle disconnect
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Default route - serve the index.html file
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Ordinals client server running at http://localhost:${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

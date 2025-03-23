import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORDINALS_SERVER_PORT = 3002;
const MAIN_CLIENT_PORT = 3001;

console.log('Starting Ordinals Server...');

// Path to the ordinals server setup
const ordinalsServerPath = path.join(__dirname, 'plugins', 'ordinals');
const ordinalsClientPath = path.join(__dirname, 'ordinals-client');

// Check if the server directory exists
if (!fs.existsSync(ordinalsServerPath)) {
  console.error(`Ordinals server directory not found: ${ordinalsServerPath}`);
  process.exit(1);
}

// Check if the client directory exists
if (!fs.existsSync(ordinalsClientPath)) {
  console.error(`Ordinals client directory not found: ${ordinalsClientPath}`);
  process.exit(1);
}

// Start the Ordinals WebSocket Server
const startOrdinalsServer = () => {
  // Implement a simple WebSocket server that bridges between the plugin and client
  const express = spawn('node', ['server.js'], {
    cwd: ordinalsClientPath,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: ORDINALS_SERVER_PORT.toString()
    }
  });

  express.on('error', (error) => {
    console.error(`Error starting Ordinals server: ${error.message}`);
    process.exit(1);
  });

  console.log(`Ordinals client server started on port ${ORDINALS_SERVER_PORT}`);
  console.log(`Main client available at http://localhost:${MAIN_CLIENT_PORT}`);
  console.log('Press Ctrl+C to stop the server');
};

// Start the server
startOrdinalsServer();

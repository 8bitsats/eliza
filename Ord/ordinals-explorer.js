#!/usr/bin/env node

/**
 * Ordinals Explorer Manager
 * 
 * This script provides a simple way to start, stop, and manage the Ordinals Explorer
 * from the command line or from within the Eliza project.
 */

import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_PORT = 8083;
const EXPLORER_DIR = path.join(__dirname, '../explorer-main');
const PID_FILE = path.join(__dirname, '.explorer-pid');

// Command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'status';
const port = args[1] || DEFAULT_PORT;

/**
 * Start the Ordinals Explorer
 */
async function startExplorer() {
  try {
    // Check if explorer is already running
    if (isExplorerRunning()) {
      console.log(`Ordinals Explorer is already running on port ${port}`);
      console.log(`Access it at: http://localhost:${port}`);
      return;
    }

    console.log(`Starting Ordinals Explorer on port ${port}...`);
    
    // Make sure we're in the explorer directory
    process.chdir(EXPLORER_DIR);
    
    // Start the explorer using npm run dev
    const explorer = spawn('npm', ['run', 'dev', '--', '-p', port], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Save the process ID to a file so we can stop it later
    fs.writeFileSync(PID_FILE, explorer.pid.toString());
    
    // Detach the process so it continues running after this script exits
    explorer.unref();
    
    console.log(`Ordinals Explorer started with PID ${explorer.pid}`);
    console.log(`Access it at: http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting Ordinals Explorer:', error.message);
    process.exit(1);
  }
}

/**
 * Stop the Ordinals Explorer
 */
async function stopExplorer() {
  try {
    if (!isExplorerRunning()) {
      console.log('Ordinals Explorer is not running');
      return;
    }
    
    const pid = fs.readFileSync(PID_FILE, 'utf8');
    
    if (process.platform === 'win32') {
      exec(`taskkill /F /PID ${pid}`);
    } else {
      exec(`kill -9 ${pid}`);
    }
    
    // Remove the PID file
    fs.unlinkSync(PID_FILE);
    
    console.log(`Ordinals Explorer (PID ${pid}) stopped`);
  } catch (error) {
    console.error('Error stopping Ordinals Explorer:', error.message);
    process.exit(1);
  }
}

/**
 * Check if the Ordinals Explorer is running
 */
function isExplorerRunning() {
  try {
    return fs.existsSync(PID_FILE);
  } catch (error) {
    return false;
  }
}

/**
 * Get the status of the Ordinals Explorer
 */
function getExplorerStatus() {
  if (isExplorerRunning()) {
    const pid = fs.readFileSync(PID_FILE, 'utf8');
    console.log(`Ordinals Explorer is running with PID ${pid}`);
    console.log(`Access it at: http://localhost:${port}`);
  } else {
    console.log('Ordinals Explorer is not running');
  }
}

// Execute the requested command
switch (command.toLowerCase()) {
  case 'start':
    startExplorer();
    break;
  case 'stop':
    stopExplorer();
    break;
  case 'restart':
    stopExplorer();
    setTimeout(startExplorer, 1000);
    break;
  case 'status':
    getExplorerStatus();
    break;
  default:
    console.log('Unknown command. Available commands: start, stop, restart, status');
    break;
}

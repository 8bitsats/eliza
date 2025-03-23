#!/bin/bash

# Script to set up and start the Ordinals Server

echo "Setting up Ordinals Server..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Make sure the public directory exists
mkdir -p public

# Start the ordinals server
echo "Starting Ordinals Server on port 3002..."
node server.js

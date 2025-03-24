#!/bin/bash

# Set up required directories
mkdir -p ~/.config/eliza/pumpfun/images
mkdir -p ~/.config/eliza/pumpfun/wallets
mkdir -p ~/.config/eliza/pumpfun/tokens

# Start the token API server
echo "Starting Token API server..."
cd server
node token-api.js &
TOKEN_API_PID=$!

# Wait for server to start
sleep 2

# Start the main application
echo "Starting Eliza application with token launcher..."
cd ..
#npm start
echo "Token launcher ready!"
echo ""
echo "You can now access the token launcher at: http://localhost:3000/token-launcher"
echo "The token API server is running on port 3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle graceful shutdown
function cleanup {
  echo "Shutting down services..."
  kill $TOKEN_API_PID
  exit 0
}

trap cleanup INT TERM

# Keep script running
wait

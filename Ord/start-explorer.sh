#!/bin/bash

# Start the Ordinals Explorer on port 3333
cd "$(dirname "$0")/explorer-main"
npm run dev -- -p 3333

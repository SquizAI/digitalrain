#!/bin/bash

echo "Running test window..."

# Kill any existing Electron processes
pkill -f Electron || true

# Wait a moment for processes to terminate
sleep 1

# Run the test window
ELECTRON_DISABLE_GPU=1 npx electron test-window.js

echo "Test complete." 
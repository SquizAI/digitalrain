#!/bin/bash

echo "Building Blue Matrix Wallpaper standalone app..."

# Kill any existing Electron processes
pkill -f Electron || true

# Wait a moment for processes to terminate
sleep 1

# Build the app
npm run build

echo "Build complete! You can find the app in the dist folder."
echo "To install, drag the app to your Applications folder." 
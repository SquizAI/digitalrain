#!/bin/bash

echo "Starting Blue Matrix Wallpaper (Plash-like mode)..."

# Kill any existing Electron processes
pkill -f Electron || true

# Wait a moment for processes to terminate
sleep 1

# Create the icon
echo "Creating icon..."
if node icon.js 2>/dev/null; then
  echo "✅ Icon created successfully"
else
  echo "⚠️ Using fallback icon"
  node icon-fallback.js
fi

# Check for macOS permissions
echo "Checking macOS permissions..."
if ! osascript -e 'tell application "System Events" to get name of every process' &>/dev/null; then
  echo "⚠️ Accessibility permissions may be needed"
  echo "Please go to System Settings > Privacy & Security > Accessibility"
  echo "and allow Terminal or your code editor to control your computer."
  echo ""
fi

# Start the application with additional flags for stability
echo "Starting application in Plash-like mode..."
ELECTRON_ENABLE_LOGGING=1 ELECTRON_DISABLE_GPU=1 ELECTRON_NO_ASAR=1 ELECTRON_TRASH=local npx electron wallpaper.js

echo "Blue Matrix Wallpaper is running in Plash-like mode!"
echo ""
echo "Look for the blue 'M' icon in your menu bar to control the wallpaper."
echo "You can toggle visibility, set it to always be on top, and more."
echo ""
echo "To stop the application, run: ./stop.sh"
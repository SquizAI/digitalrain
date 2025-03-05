#!/bin/bash

echo "Starting Blue Matrix Wallpaper in DEBUG MODE..."

# Check if icon exists, create it if not
if [ ! -f "icon.png" ]; then
  echo "Creating icon..."
  convert -size 32x32 xc:blue -fill white -gravity center -font "Arial" -pointsize 20 -annotate 0 "M" icon.png
fi

# Set environment variables for debugging
export ELECTRON_ENABLE_LOGGING=true
export ELECTRON_ENABLE_STACK_DUMPING=true
export DEBUG_MODE=true

# Disable GPU acceleration to prevent crashes
export ELECTRON_DISABLE_GPU=1
export ELECTRON_FORCE_SOFTWARE_RENDERING=1
export ELECTRON_NO_ASAR=1

echo "Debug mode is enabled. Windows will have frames and developer tools will be available."

# Start the application
npm start

echo "Blue Matrix Wallpaper is running in DEBUG MODE!"
echo "Look for the blue 'M' icon in your menu bar to control the application."
echo "To stop the application, run: ./stop.sh" 
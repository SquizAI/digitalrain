#!/bin/bash

echo "Building Blue Matrix Wallpaper as a macOS application..."

# Create the app icon
echo "Creating app icon..."
./create-icon.sh

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the application
echo "Building application..."
npm run build

echo "✅ Build complete!"
echo ""
echo "Your application has been built and can be found in the 'dist' directory."
echo "You can now:"
echo "1. Install the application by opening the DMG file in the 'dist' directory"
echo "2. Drag the application to your Applications folder"
echo "3. Launch it from Launchpad or Applications folder"
echo ""
echo "The application will appear in Launchpad with the Blue Matrix icon."
echo "It will run as a standalone application without requiring Plash or any other third-party software." 
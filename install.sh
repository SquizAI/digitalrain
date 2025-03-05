#!/bin/bash

echo "DigitalRain Installation"
echo "========================"

# Build the application
echo "Building DigitalRain application..."
npm run build

# Check if the application exists in the Applications folder
if [ -d "/Applications/DigitalRain.app" ]; then
    echo "Found existing installation, removing..."
    rm -rf "/Applications/DigitalRain.app"
fi

# Copy the application to the Applications folder
echo "Installing DigitalRain to Applications folder..."
cp -R "dist/mac-arm64/DigitalRain.app" "/Applications/"

# Set permissions
echo "Setting permissions..."
chmod -R 755 "/Applications/DigitalRain.app"

# Add to login items
echo "Adding DigitalRain to startup items..."
osascript <<EOD
tell application "System Events"
    make login item at end with properties {path:"/Applications/DigitalRain.app", hidden:false}
end tell
EOD

echo "Installation complete!"
echo "DigitalRain has been installed and will start automatically when you log in."
echo ""
echo "To start DigitalRain now, run:"
echo "open /Applications/DigitalRain.app"
echo ""

# Ask if user wants to start the application now
read -p "Do you want to start DigitalRain now? (y/n): " answer
if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "Starting DigitalRain..."
    open "/Applications/DigitalRain.app"
else
    echo "You can start DigitalRain later by clicking on it in your Applications folder."
fi 
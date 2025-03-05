#!/bin/bash

echo "Blue Matrix Wallpaper Setup"
echo "=========================="
echo ""

# Get the absolute path to the project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "This script will help you set the Blue Matrix animation as your wallpaper."
echo ""
echo "Since macOS doesn't natively support animated wallpapers, we have several options:"
echo ""

echo "Option 1: Use Plash (Recommended)"
echo "--------------------------------"
echo "Plash is a specialized app that can set web content as your wallpaper."
echo "1. Install Plash from: https://sindresorhus.com/plash"
echo "2. Run our setup script: ./setup_plash.sh"
echo ""

echo "Option 2: Use Safari in Full Screen"
echo "---------------------------------"
echo "1. Run: ./open_in_safari.sh"
echo "2. Press Cmd+Shift+F to enter full-screen mode"
echo "3. Hide the toolbar (View > Hide Toolbar)"
echo "4. Use Mission Control to place this window behind all others"
echo ""

echo "Option 3: Use the Electron App"
echo "----------------------------"
echo "1. Run: ./run.sh"
echo "2. The Matrix animation will appear in windows on each display"
echo "3. Use the tray icon (blue 'M' in menu bar) to control visibility"
echo ""

echo "Option 4: Build as a macOS App"
echo "----------------------------"
echo "1. Run: ./build-app.sh"
echo "2. Install the created DMG file"
echo "3. Launch from Applications folder or Launchpad"
echo ""

# Ask the user which option they want to try
echo "Which option would you like to try? (1-4)"
read -p "> " option

case $option in
  1)
    echo "Running Plash setup..."
    ./setup_plash.sh
    ;;
  2)
    echo "Opening in Safari..."
    ./open_in_safari.sh
    ;;
  3)
    echo "Running Electron app..."
    ./run.sh
    ;;
  4)
    echo "Building macOS app..."
    ./build-app.sh
    ;;
  *)
    echo "Invalid option. Please run the script again and select a number between 1-4."
    exit 1
    ;;
esac

echo ""
echo "✨ Setup initiated! ✨"
echo ""
echo "If you encounter any issues, please check the README.md file for troubleshooting tips."

# Make the script executable
chmod +x "$0" 
#!/bin/bash

echo "Blue Matrix Wallpaper Status"
echo "==========================="
echo ""

# Check if Electron processes are running
ELECTRON_COUNT=$(ps aux | grep Electron | grep -v grep | wc -l)

if [ $ELECTRON_COUNT -gt 0 ]; then
    echo "✅ Blue Matrix Wallpaper is running"
    echo "Found $ELECTRON_COUNT Electron processes"
    echo ""
    echo "To control the wallpaper:"
    echo "- Look for the tray icon in the menu bar"
    echo "- Press Cmd+Option+M to toggle visibility"
    echo "- Run ./run.sh to restart if needed"
else
    echo "❌ Blue Matrix Wallpaper is not running"
    echo ""
    echo "To start the wallpaper, run:"
    echo "./run.sh"
fi 
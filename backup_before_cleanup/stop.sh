#!/bin/bash

echo "Stopping Blue Matrix Wallpaper..."

# Kill any existing Electron processes
pkill -f Electron || true

echo "✅ Blue Matrix Wallpaper has been stopped"
echo ""
echo "To start it again, run:"
echo "./run.sh" 
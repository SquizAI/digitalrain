#!/bin/bash

echo "Opening Blue Matrix Wallpaper in Safari..."

# Get the absolute path to the standalone.html file
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HTML_PATH="file://$SCRIPT_DIR/standalone.html"

# Open in Safari
open -a Safari "$HTML_PATH"

echo "✨ Done! ✨"
echo ""
echo "To use as a wallpaper:"
echo "1. Press Cmd+Shift+F to enter full-screen mode"
echo "2. Hide the toolbar (View > Hide Toolbar)"
echo "3. Use Mission Control to place this window behind all others"
echo ""
echo "Or follow the instructions in the README.md file for other methods." 
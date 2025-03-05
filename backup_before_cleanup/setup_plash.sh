#!/bin/bash

echo "Blue Matrix Dynamic Background Setup with Plash"
echo "=============================================="
echo ""

# Check if Plash is installed
if [ -d "/Applications/Plash.app" ]; then
    echo "✅ Plash is installed"
else
    echo "❌ Plash not found"
    echo "Please install Plash from the App Store or https://sindresorhus.com/plash"
    echo "After installing Plash, run this script again."
    open "https://sindresorhus.com/plash"
    exit 1
fi

# Get the absolute path to the standalone.html file
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HTML_PATH="file://$SCRIPT_DIR/standalone.html"

echo "📂 Found standalone.html at: $HTML_PATH"
echo ""
echo "Opening Plash and configuring it to use your Blue Matrix background..."

# Launch Plash and try to set the URL
open -a Plash "$HTML_PATH"

echo ""
echo "✨ Setup complete! ✨"
echo ""
echo "Important Plash settings to check:"
echo "1. Click the Plash icon in the menu bar"
echo "2. Select 'Preferences...'"
echo "3. Make sure 'Start at login' is enabled"
echo "4. Under 'Website', ensure the URL is set to: $HTML_PATH"
echo "5. Under 'Appearance', set:"
echo "   - Opacity: 100%"
echo "   - Scale: 100%"
echo "   - Position: Fill"
echo "6. Under 'Advanced', enable:"
echo "   - 'Keep window always on desktop level'"
echo "   - 'Disable interaction with website'"
echo ""
echo "To see your wallpaper:"
echo "1. Close any open windows or use Mission Control to see your desktop"
echo "2. The Matrix animation should now be visible as your wallpaper"
echo ""
echo "If you don't see the animation, try:"
echo "1. Restarting Plash (quit and reopen)"
echo "2. Checking that the URL is correctly set in Plash preferences"
echo "3. Making sure no windows are covering your desktop"

# Make the script executable
chmod +x "$0" 
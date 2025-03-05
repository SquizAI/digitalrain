#!/bin/bash

echo "Blue Matrix Wallpaper Debug Tool"
echo "=============================="
echo ""

# Check if Electron processes are running
ELECTRON_COUNT=$(ps aux | grep Electron | grep -v grep | wc -l)

if [ $ELECTRON_COUNT -gt 0 ]; then
    echo "✅ Blue Matrix Wallpaper is running"
    echo "Found $ELECTRON_COUNT Electron processes"
else
    echo "❌ Blue Matrix Wallpaper is not running"
    echo ""
    echo "To start the wallpaper, run:"
    echo "./run.sh"
    exit 1
fi

echo ""
echo "Checking macOS permissions..."

# Check for Screen Recording permission
if ! osascript -e 'tell application "System Events" to get name of every process' &>/dev/null; then
    echo "❌ Accessibility permissions may be missing"
    echo "Please go to System Settings > Privacy & Security > Accessibility"
    echo "and allow Terminal or your code editor to control your computer."
else
    echo "✅ Accessibility permissions appear to be granted"
fi

echo ""
echo "Checking window visibility..."
osascript -e 'tell application "System Events" to get name of every window of every process' 2>/dev/null | grep -i electron || echo "❌ No Electron windows found in System Events"

echo ""
echo "Checking display information..."
system_profiler SPDisplaysDataType | grep -A 10 "Display"

echo ""
echo "Checking window layers..."
echo "Your windows might be hidden behind other applications or under the desktop."
echo "Try using the tray icon to toggle visibility or press Cmd+Option+M."

echo ""
echo "Debugging suggestions:"
echo "1. Run './stop.sh' to stop all instances"
echo "2. Run './run.sh' to restart with debugging enabled"
echo "3. Check if windows appear briefly before disappearing"
echo "4. Try setting 'alwaysOnTop: true' in main.js"
echo "5. Check macOS Security & Privacy settings"
echo ""
echo "If you still can't see the windows, try running:"
echo "defaults write com.apple.WindowManager EnableStandardClickToShowDesktop -bool false"
echo "killall Dock"
echo ""
echo "This disables the macOS feature that hides windows when clicking on the desktop." 
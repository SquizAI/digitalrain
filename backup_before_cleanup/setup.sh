#!/bin/bash

echo "Setting up Blue Matrix Wallpaper with Plash..."

# Check if Plash is installed
if [ ! -d "/Applications/Plash.app" ]; then
  echo "❌ Plash is not installed."
  echo "Please download and install Plash from: https://github.com/sindresorhus/Plash/releases"
  echo "After installing Plash, run this script again."
  exit 1
fi

# Get the absolute path to the index.html file
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INDEX_PATH="file://$CURRENT_DIR/index.html"

echo "✅ Plash is installed."
echo "Opening Plash and configuring it to use the Blue Matrix Wallpaper..."

# First, quit Plash if it's already running
osascript -e 'tell application "Plash" to quit' 2>/dev/null

# Wait a moment for Plash to fully quit
sleep 1

# Open Plash with our index.html
open -a Plash "$INDEX_PATH"

# Wait for Plash to open
sleep 2

# Use AppleScript to configure Plash settings
osascript <<EOD
tell application "Plash"
  activate
  delay 1
  
  # Click on the Plash menu bar icon
  tell application "System Events"
    # Try to find and click the Plash menu bar icon
    try
      click menu bar item of menu bar 1 whose description contains "Plash"
      delay 0.5
      
      # Click on Preferences
      click menu item "Preferences…" of menu 1
      delay 1
      
      # Try to configure settings if the preference window is open
      try
        # Set opacity to 100%
        set opacitySlider to slider 1 of window "Preferences"
        set value of opacitySlider to 100
        
        # Enable "Ignore mouse events"
        set ignoreMouseCheckbox to checkbox "Ignore mouse events" of window "Preferences"
        set checkboxState to value of ignoreMouseCheckbox as boolean
        if not checkboxState then
          click ignoreMouseCheckbox
        end if
        
        # Enable "Start at login"
        set startAtLoginCheckbox to checkbox "Start at login" of window "Preferences"
        set checkboxState to value of startAtLoginCheckbox as boolean
        if not checkboxState then
          click startAtLoginCheckbox
        end if
        
        # Look for display selection dropdown and select "All Displays" if available
        # Note: This is based on research that suggests Plash might have a display selection option
        try
          # Try to find a popup button or dropdown for display selection
          set displayPopup to popup button 1 of window "Preferences"
          click displayPopup
          delay 0.5
          # Try to select an option that might represent all displays
          click menu item 1 of menu 1 of displayPopup
        end try
        
        # Close preferences
        click button "Close" of window "Preferences"
      end try
    end try
  end tell
end tell
EOD

# For multiple monitors, we need to use the workaround suggested by the developer
# Download additional instances of Plash for other monitors
echo "Setting up multiple monitor support..."

# Function to download and set up additional Plash instances
setup_additional_plash() {
  local plash_num=$1
  local plash_url="https://github.com/sindresorhus/Plash/files/12036349/Plash.$plash_num.app.zip"
  local plash_app="/Applications/Plash $plash_num.app"
  
  if [ ! -d "$plash_app" ]; then
    echo "Downloading Plash $plash_num for additional monitor..."
    curl -L "$plash_url" -o "/tmp/Plash$plash_num.zip"
    unzip -q "/tmp/Plash$plash_num.zip" -d "/Applications/"
    rm "/tmp/Plash$plash_num.zip"
    
    # Open the additional Plash instance with our index.html
    open -a "Plash $plash_num" "$INDEX_PATH"
    sleep 2
    
    # Configure this instance
    osascript <<EOD
tell application "Plash $plash_num"
  activate
  delay 1
  
  tell application "System Events"
    try
      click menu bar item of menu bar 1 whose description contains "Plash"
      delay 0.5
      
      click menu item "Preferences…" of menu 1
      delay 1
      
      try
        # Set opacity to 100%
        set opacitySlider to slider 1 of window "Preferences"
        set value of opacitySlider to 100
        
        # Enable "Ignore mouse events"
        set ignoreMouseCheckbox to checkbox "Ignore mouse events" of window "Preferences"
        set checkboxState to value of ignoreMouseCheckbox as boolean
        if not checkboxState then
          click ignoreMouseCheckbox
        end if
        
        # Enable "Start at login"
        set startAtLoginCheckbox to checkbox "Start at login" of window "Preferences"
        set checkboxState to value of startAtLoginCheckbox as boolean
        if not checkboxState then
          click startAtLoginCheckbox
        end if
        
        # Try to select a different display than the main Plash
        try
          set displayPopup to popup button 1 of window "Preferences"
          click displayPopup
          delay 0.5
          click menu item $plash_num of menu 1 of displayPopup
        end try
        
        # Enable "Hide menu bar icon" to avoid clutter
        set hideIconCheckbox to checkbox "Hide menu bar icon" of window "Preferences"
        set checkboxState to value of hideIconCheckbox as boolean
        if not checkboxState then
          click hideIconCheckbox
        end if
        
        # Close preferences
        click button "Close" of window "Preferences"
      end try
    end try
  end tell
end tell
EOD
  fi
}

# Set up additional Plash instances for other monitors
# We'll set up 2 additional instances for a total of 3 monitors
setup_additional_plash 2
setup_additional_plash 3

echo ""
echo "✅ Setup complete!"
echo ""
echo "Instructions for Plash:"
echo "1. Make sure 'Start at Login' is enabled in Plash preferences"
echo "2. Set 'Opacity' to 100% for best results"
echo "3. Enable 'Ignore Mouse Events' to interact with desktop icons"
echo "4. For multiple monitors: We've set up multiple instances of Plash"
echo "   Each instance should be configured for a different monitor"
echo "5. You can access Plash settings from its menu bar icon"
echo ""
echo "To customize the Matrix animation, edit the matrix.js file."
echo "To stop using the wallpaper, quit Plash from its menu bar icon." 
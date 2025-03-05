#!/bin/bash

echo "Creating Blue Matrix Wallpaper icon..."

# Create the app icon using our Node.js script
node app-icon.js

# Check if the PNG was created
if [ ! -f "app-icon.png" ]; then
  echo "❌ Failed to create app-icon.png"
  exit 1
fi

echo "✅ Created app-icon.png"

# Create a temporary iconset directory
mkdir -p BlueMatrixIcon.iconset

# Generate different icon sizes
echo "Generating icon sizes..."
sips -z 16 16 app-icon.png --out BlueMatrixIcon.iconset/icon_16x16.png
sips -z 32 32 app-icon.png --out BlueMatrixIcon.iconset/icon_16x16@2x.png
sips -z 32 32 app-icon.png --out BlueMatrixIcon.iconset/icon_32x32.png
sips -z 64 64 app-icon.png --out BlueMatrixIcon.iconset/icon_32x32@2x.png
sips -z 128 128 app-icon.png --out BlueMatrixIcon.iconset/icon_128x128.png
sips -z 256 256 app-icon.png --out BlueMatrixIcon.iconset/icon_128x128@2x.png
sips -z 256 256 app-icon.png --out BlueMatrixIcon.iconset/icon_256x256.png
sips -z 512 512 app-icon.png --out BlueMatrixIcon.iconset/icon_256x256@2x.png
sips -z 512 512 app-icon.png --out BlueMatrixIcon.iconset/icon_512x512.png
sips -z 1024 1024 app-icon.png --out BlueMatrixIcon.iconset/icon_512x512@2x.png

# Convert the iconset to icns
echo "Converting to .icns format..."
iconutil -c icns BlueMatrixIcon.iconset -o app-icon.icns

# Clean up
rm -rf BlueMatrixIcon.iconset

echo "✅ Created app-icon.icns"
echo "The icon is ready for building the application." 
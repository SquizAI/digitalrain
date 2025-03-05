#!/bin/bash

echo "Cleaning up DigitalRain project files..."

# Files we want to keep
keep_files=(
  "README.md"
  "main.js"
  "matrix.js"
  "style.css"
  "index.html"
  "package.json"
  "package-lock.json"
  "install.sh"
  "cleanup.sh"
  "github_deploy.sh"
  "icon.png"
  "icon.icns"
  "app-icon.png"
  "screenshot.png"
  "build/"
  "node_modules/"
  "dist/"
  ".git/"
  ".gitignore"
  "LICENSE"
)

# Create a temporary directory for backup
mkdir -p backup_before_cleanup
echo "Creating backup of all files in backup_before_cleanup/"

# Backup all files first
for file in *; do
  if [ -f "$file" ] && [ "$file" != "cleanup.sh" ]; then
    cp "$file" backup_before_cleanup/
  fi
done

# Remove files not in the keep list
for file in *; do
  if [ -f "$file" ]; then
    should_keep=false
    for keep in "${keep_files[@]}"; do
      if [ "$file" == "$keep" ]; then
        should_keep=true
        break
      fi
      # Check if it's a directory we want to keep
      if [[ "$keep" == */ ]] && [[ -d "$file" ]] && [[ "$file/" == "$keep" ]]; then
        should_keep=true
        break
      fi
    done
    
    if [ "$should_keep" = false ]; then
      echo "Removing $file"
      rm "$file"
    fi
  fi
done

# Create a .gitignore file
cat > .gitignore << EOL
# Dependencies
node_modules/

# Build output
dist/

# macOS system files
.DS_Store
.AppleDouble
.LSOverride
._*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs
*.log

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
EOL

# Create a LICENSE file if it doesn't exist
if [ ! -f "LICENSE" ]; then
  cat > LICENSE << EOL
MIT License

Copyright (c) $(date +%Y) 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOL
fi

echo "DigitalRain project cleanup complete!"
echo "Ready for GitHub deployment." 
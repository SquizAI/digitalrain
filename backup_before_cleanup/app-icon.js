const fs = require('fs');
const { createCanvas } = require('canvas');

console.log("Creating app icon...");

// Create a 1024x1024 canvas (standard size for macOS app icons)
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Fill background with dark blue
ctx.fillStyle = '#000033';
ctx.fillRect(0, 0, 1024, 1024);

// Add a blue glow in the center
const gradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 500);
gradient.addColorStop(0, 'rgba(0, 100, 255, 0.8)');
gradient.addColorStop(1, 'rgba(0, 30, 100, 0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1024, 1024);

// Draw Matrix-like characters
ctx.font = '40px monospace';
ctx.fillStyle = '#00ff99';

// Generate random Matrix characters
const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const rows = 20;
const cols = 20;
const cellSize = 1024 / cols;

for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    if (Math.random() > 0.7) { // Only draw some characters for a sparse effect
      const char = characters.charAt(Math.floor(Math.random() * characters.length));
      const x = j * cellSize + cellSize / 2;
      const y = i * cellSize + cellSize / 2;
      const brightness = Math.random() * 0.5 + 0.5; // Random brightness
      
      ctx.fillStyle = `rgba(0, ${Math.floor(200 * brightness)}, ${Math.floor(150 * brightness)}, ${brightness})`;
      ctx.fillText(char, x, y);
    }
  }
}

// Draw a large "M" in the center
ctx.font = 'bold 500px monospace';
ctx.fillStyle = '#00ccff';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('M', 512, 512);

// Add a subtle glow to the "M"
ctx.shadowColor = '#00ccff';
ctx.shadowBlur = 30;
ctx.fillText('M', 512, 512);

// Save the icon
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('app-icon.png', buffer);

console.log("App icon created successfully!"); 
const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a 32x32 icon with a Matrix-style "M" letter
const size = 32;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Fill background with black
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, size, size);

// Draw a blue "M" in the center
ctx.font = 'bold 24px monospace';
ctx.fillStyle = '#00AAFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('M', size/2, size/2);

// Add a subtle glow effect
ctx.shadowColor = '#00FFFF';
ctx.shadowBlur = 5;
ctx.fillText('M', size/2, size/2);

// Convert to PNG buffer
const buffer = canvas.toBuffer('image/png');

// Write the icon to disk
fs.writeFileSync('icon.png', buffer);

console.log('Matrix icon created successfully'); 
const fs = require('fs');

// Create a simple blue square icon (16x16 pixels)
// This is a base64-encoded PNG file of a blue square
const iconData = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAT5JREFUeNpi/P//PwMlgImBQjDwBrCgCzDOm7fWH0jNB+L/OMTnA3Hb7NmF85qbm+XRDXBfsmSdPxMT03wgVxzNkP9A/BuI/wHxbyifEajmNxMT4/zFixvnNTY2ymMYsGzZOv+HDx/PB3LFWVhYGP79+8fw9+9fht+/fzP8+vULjH/8+MHw/ft3hm/fvjF8/vyZ4dOnTwwfP35k+PDhA8P79+8Z3r17B8b//v1jYGZmZpw/f+78hoYGeeaVK9f5P3r0eP7Pnz/FgZpRvA82BOgVBmZmRgZmZhaGP3/+Mnz//p3h69evYEM+f/4CNgSbAYyzZs3zB3qRgZmZBcUQZD4jI8TpMEPAXgAagmIAzJnIzoZhJkZGiAFMTBBDQF4AGQIzBMTHMACbITBDQF5ANgTZEBB/3rx5jIzUzgsAAQYAWEEqvMt7G0gAAAAASUVORK5CYII=',
  'base64'
);

// Write the icon to disk
fs.writeFileSync('icon.png', iconData);

console.log('Fallback icon created successfully'); 
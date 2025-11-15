#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const publicDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n✅ Icon generation complete!');
}

generateIcons().catch(console.error);

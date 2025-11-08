const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 384, name: 'icon-384.png' }
];

const inputSVG = path.join(__dirname, 'public', 'logo.svg');
const outputDir = path.join(__dirname, 'public', 'icons');

// Crea la directory icons se non esiste
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generazione icone PWA in corso...');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);
      await sharp(inputSVG)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generata: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Errore generando ${name}:`, error.message);
    }
  }

  console.log('\n✓ Generazione icone completata!');
}

generateIcons().catch(console.error);

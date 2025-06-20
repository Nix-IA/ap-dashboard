const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, 'public', 'og-image.svg');
    const pngPath = path.join(__dirname, 'public', 'og-image.png');

    console.log('Converting SVG to PNG...');
    console.log('SVG path:', svgPath);
    console.log('PNG path:', pngPath);

    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Convert to PNG with Sharp
    await sharp(svgBuffer).png().resize(1200, 630).toFile(pngPath);

    console.log('✅ Successfully converted og-image.svg to og-image.png');

    // Verify file was created
    const stats = fs.statSync(pngPath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

convertSvgToPng();

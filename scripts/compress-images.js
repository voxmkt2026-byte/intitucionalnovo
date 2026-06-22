const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'public', 'img');
const TARGET_QUALITY = 55;
const MAX_WIDTH = 800;

async function compressImages() {
  const files = fs.readdirSync(IMG_DIR).filter(f => f.startsWith('seg-') && f.endsWith('.webp'));
  
  console.log(`Found ${files.length} segment images to compress\n`);
  
  for (const file of files) {
    const filePath = path.join(IMG_DIR, file);
    const tempPath = filePath + '.tmp';
    const originalSize = fs.statSync(filePath).size;
    
    try {
      await sharp(filePath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: TARGET_QUALITY, effort: 6 })
        .toFile(tempPath);
      
      const newSize = fs.statSync(tempPath).size;
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      const savings = Math.round((1 - newSize / originalSize) * 100);
      
      console.log(`${file}: ${Math.round(originalSize/1024)}KB -> ${Math.round(newSize/1024)}KB (${savings}% saved)`);
    } catch (err) {
      console.error(`SKIP ${file}: ${err.message}`);
      try { fs.unlinkSync(tempPath); } catch {}
    }
  }
  
  console.log('\nDone!');
}

compressImages().catch(console.error);

const fs = require('fs');
const path = require('path');

const CATEGORIES_TO_SPLIT = ['alternators', 'starters'];
const CHUNK_SIZE = 1500; // ~12MB per chunk (well below GitHub's 50MB warning threshold)

function splitCategory(categoryName) {
  const srcFile = path.join(__dirname, `../src/data/categories/${categoryName}.json`);
  const publicFile = path.join(__dirname, `../public/data/categories/${categoryName}.json`);

  if (!fs.existsSync(srcFile)) {
    console.log(`Skipping ${categoryName}, file not found at ${srcFile}`);
    return;
  }

  console.log(`Processing ${categoryName}...`);
  const items = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
  console.log(`  Total items: ${items.length}`);

  const targetDirs = [
    path.join(__dirname, `../src/data/categories/${categoryName}`),
    path.join(__dirname, `../public/data/categories/${categoryName}`)
  ];

  targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const totalChunks = Math.ceil(items.length / CHUNK_SIZE);
  const skuMap = {}; // sku.toLowerCase() -> chunkIndex

  for (let i = 0; i < totalChunks; i++) {
    const chunk = items.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    chunk.forEach(p => {
      skuMap[p.sku.toLowerCase()] = i;
    });

    const chunkContent = JSON.stringify(chunk);
    targetDirs.forEach(dir => {
      fs.writeFileSync(path.join(dir, `chunk_${i}.json`), chunkContent);
    });
    console.log(`  Chunk ${i}: ${chunk.length} items (${(chunkContent.length / 1024 / 1024).toFixed(2)} MB)`);
  }

  const manifest = {
    category: categoryName,
    totalItems: items.length,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    skuMap
  };

  const manifestContent = JSON.stringify(manifest);
  targetDirs.forEach(dir => {
    fs.writeFileSync(path.join(dir, 'manifest.json'), manifestContent);
  });
  console.log(`  Manifest written with ${Object.keys(skuMap).length} SKUs mapped.`);

  // Remove original 80MB files
  if (fs.existsSync(srcFile)) fs.unlinkSync(srcFile);
  if (fs.existsSync(publicFile)) fs.unlinkSync(publicFile);
  console.log(`  Original monolithic ${categoryName}.json deleted.`);
}

CATEGORIES_TO_SPLIT.forEach(splitCategory);
console.log('Category split completed successfully.');

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

function fixImages() {
  const csvPath = path.join(__dirname, 'public', 'data', 'productos_plantilla.csv');
  const scrapedJsonPath = path.join(__dirname, 'scrapedProducts.json');
  
  if (!fs.existsSync(csvPath) || !fs.existsSync(scrapedJsonPath)) {
    console.error("Missing files.");
    return;
  }

  // 1. Load scraped products mappings
  const scrapedProducts = JSON.parse(fs.readFileSync(scrapedJsonPath, 'utf8'));
  const nameToImage = {};
  for (const sp of scrapedProducts) {
    if (sp.name && sp.image) {
      // Convert /Ananas/images/... to /images/...
      nameToImage[sp.name.trim()] = sp.image.replace('/Ananas/images/', '/images/');
    }
  }

  // 2. Load CSV using PapaParse to handle semicolons
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvData, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true
  });

  let updatedCount = 0;
  let placeholderCount = 0;

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const name = row.name ? row.name.trim() : '';
    
    if (nameToImage[name]) {
      row.image = nameToImage[name];
      updatedCount++;
    } else {
      // Use placeholder with the product name
      const encodedName = encodeURIComponent(name);
      row.image = `https://placehold.co/400x400/EEE/31343C?text=${encodedName}`;
      placeholderCount++;
    }
  }

  // 3. Write back CSV
  const newCsvData = Papa.unparse(parsed.data, {
    delimiter: ';',
    quotes: true // ensure fields are quoted
  });

  fs.writeFileSync(csvPath, newCsvData, 'utf8');
  console.log(`CSV updated. Re-mapped ${updatedCount} images. Assigned ${placeholderCount} placeholders.`);
}

fixImages();

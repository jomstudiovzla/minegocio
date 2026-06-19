import * as fs from 'fs';
import * as path from 'path';

function fixCsv() {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'productos_plantilla.csv');
  const scrapedDir = path.join(process.cwd(), 'public', 'images', 'products', 'scraped');
  
  if (!fs.existsSync(csvPath) || !fs.existsSync(scrapedDir)) {
    console.error("Missing files.");
    return;
  }

  const images = fs.readdirSync(scrapedDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  if (images.length === 0) return;

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  const imageIndex = headers.indexOf('image');

  if (imageIndex === -1) return;

  let imgCounter = 0;
  const newLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const cols = lines[i].split(',');
    
    // Asignar una imagen real del directorio scraped
    const realImage = `/images/products/scraped/${images[imgCounter % images.length]}`;
    cols[imageIndex] = realImage;
    
    newLines.push(cols.join(','));
    imgCounter++;
  }

  fs.writeFileSync(csvPath, newLines.join('\n'));
  console.log("CSV actualizado con imágenes reales.");
}

fixCsv();

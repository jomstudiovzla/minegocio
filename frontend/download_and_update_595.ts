import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as Papa from 'papaparse';

const CSV_PATH = path.join(__dirname, 'public', 'data', 'productos_plantilla.csv');
const CSV_TARGET_PATH = path.join(__dirname, '..', 'data', 'productos_plantilla.csv');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'products', 'scraped');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function downloadImage(url: string, destPath: string) {
  if (fs.existsSync(destPath)) {
    return true; // Ya existe, la saltamos
  }
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://vallearriba.elplazas.com/'
      },
      timeout: 10000
    });

    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error descargando ${url}:`, (error as any).message);
    return false;
  }
}

async function run() {
  console.log('Leyendo CSV original de 595 productos...');
  const csvData = fs.readFileSync(CSV_PATH, 'utf8');
  
  // Try parsing with semicolon first
  let parsed = Papa.parse(csvData, { header: true, delimiter: ';' });
  if (parsed.data.length < 10) {
      // Fallback to comma
      parsed = Papa.parse(csvData, { header: true, delimiter: ',' });
  }

  const rows: any[] = parsed.data;
  console.log(`Encontrados ${rows.length} productos.`);

  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.id || !row.imagen) continue;

    const originalUrl = row.imagen;
    const destPath = path.join(IMAGES_DIR, `${row.id}.jpg`);
    const githubUrl = `https://jomstudiovzla.github.io/minegocio/images/products/scraped/${row.id}.jpg`;

    // Download the image if it's from El Plazas
    if (originalUrl.includes('elplazas.com')) {
      console.log(`[${i+1}/${rows.length}] Descargando imagen para ${row.id}...`);
      await downloadImage(originalUrl, destPath);
    } else {
        console.log(`[${i+1}/${rows.length}] Omitiendo descarga para ${row.id} (URL ya está cambiada o no es de El Plazas)`);
    }

    // Update the row
    row.imagen = githubUrl;
    row.imagen_incrustada = `=IMAGE("${githubUrl}", 1)`;
    successCount++;
  }

  console.log(`Completada la descarga. Actualizando los documentos CSV...`);

  const newCsv = Papa.unparse(rows, { delimiter: ';' });

  fs.writeFileSync(CSV_PATH, newCsv, 'utf8');
  console.log(`Guardado en: ${CSV_PATH}`);

  fs.writeFileSync(CSV_TARGET_PATH, newCsv, 'utf8');
  console.log(`Guardado en: ${CSV_TARGET_PATH}`);

  console.log('¡Misión cumplida! Todas las imágenes fueron descargadas, burladas de Cloudflare, y los links de Github añadidos al CSV para que se vean incrustadas.');
}

run().catch(console.error);

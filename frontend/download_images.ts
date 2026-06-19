import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as Papa from 'papaparse';

const IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'products', 'scraped');

async function downloadImages() {
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  const csvPath = path.join(process.cwd(), 'public', 'data', 'inventario_extenso.csv');
  if (!fs.existsSync(csvPath)) {
    console.error("No se encontró el CSV:", csvPath);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvData, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  });

  const products = parsed.data as any[];
  console.log(`Encontrados ${products.length} productos para descargar imágenes.`);

  for (const row of products) {
    if (!row.id || !row.imagen || !row.imagen.startsWith('http')) continue;

    const imgUrl = row.imagen;
    const destPath = path.join(IMAGE_DIR, `${row.id}.jpg`);

    if (fs.existsSync(destPath)) {
      console.log(`[SKIP] Imagen para ${row.id} ya existe.`);
      continue;
    }

    try {
      console.log(`Descargando imagen para ${row.id} -> ${imgUrl}`);
      const response = await axios({
        url: imgUrl,
        method: 'GET',
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const writer = fs.createWriteStream(destPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Pequeña pausa para no saturar al servidor (agresivo pero prudente)
      await new Promise(r => setTimeout(r, 100));

    } catch (e: any) {
      console.error(`[ERROR] Falló la descarga de ${row.id}: ${e.message}`);
    }
  }

  console.log('¡Descarga de imágenes completada!');
}

downloadImages().catch(console.error);

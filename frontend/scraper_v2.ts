import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://vallearriba.elplazas.com';

const categories = [
  { url: '/frutas-y-vegetales.html', category: 'frutas-vegetales' },
  { url: '/refrigerados-y-congelados/carnes-aves-y-pescado.html', category: 'refrigerados-congelados' },
  { url: '/refrigerados-y-congelados/charcuteria.html', category: 'refrigerados-congelados' },
  { url: '/viveres/arroz-granos-y-pastas.html', category: 'viveres' },
  { url: '/viveres/bebidas.html', category: 'viveres' },
  { url: '/viveres/snacks.html', category: 'viveres' },
  { url: '/viveres/galletas.html', category: 'viveres' },
  { url: '/limpieza.html', category: 'limpieza' },
  { url: '/cuidado-personal-y-salud.html', category: 'cuidado-personal-salud' }
];

const OUTPUT_CSV = path.join(process.cwd(), 'public', 'data', 'productos_plantilla.csv');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products', 'scraped');

async function downloadImage(url: string, filename: string) {
  const filepath = path.join(IMAGES_DIR, filename);
  const writer = fs.createWriteStream(filepath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function scrape() {
  if (fs.existsSync(IMAGES_DIR)) {
    console.log('Limpiando directorio de imágenes...');
    fs.rmSync(IMAGES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  let products = [];
  let idCounter = 1;

  for (const cat of categories) {
    console.log(`Scraping ${cat.url}...`);
    try {
      // Scrape up to 3 pages per category for more inventory
      for (let page = 1; page <= 3; page++) {
        const pageUrl = `${BASE_URL}${cat.url}?p=${page}`;
        const res = await axios.get(pageUrl);
        const $ = cheerio.load(res.data);

        const items = $('.item.product.product-item');
        if (items.length === 0) break;

        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          const name = $(el).find('.product-item-link').text().trim().replace(/"/g, '""');
          let priceText = $(el).find('.price').first().text().trim();
          let price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'));
          
          if (isNaN(price)) price = parseFloat((Math.random() * 10 + 1).toFixed(2));
          
          const imgUrl = $(el).find('.product-image-photo').attr('src');
          
          if (name && imgUrl && !imgUrl.includes('placeholder')) {
            const ext = path.extname(imgUrl.split('?')[0]) || '.jpg';
            const filename = `scraped_p${idCounter}${ext}`;
            const localImagePath = `/images/products/scraped/${filename}`;
            
            try {
              await downloadImage(imgUrl, filename);
              
              const stock = Math.floor(Math.random() * 100) + 10;
              const warehouseStock = Math.floor(Math.random() * 500) + 100;
              const unit = "1 Unidad";
              const label = Math.random() > 0.8 ? "Nuevo" : "";

              // Use semicolon delimiter and quote fields
              products.push(`"p${idCounter}";"${name}";"${price}";"${cat.category}";"General";"${localImagePath}";"${unit}";"${label}";"${stock}";"${warehouseStock}"`);
              console.log(`Scraped: ${name} -> ${filename}`);
              idCounter++;
            } catch (err) {
              console.error(`Failed to download image for ${name}: ${err.message}`);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed to scrape ${cat.url}: ${e.message}`);
    }
  }

  const csvHeader = '"id";"name";"price";"category";"subcategory";"image";"unit";"labels";"stock";"warehouseStock"\n';
  const csvContent = csvHeader + products.join('\n');
  fs.writeFileSync(OUTPUT_CSV, csvContent);
  console.log(`Scraping finalizado. ${products.length} productos guardados en ${OUTPUT_CSV}`);
}

scrape().catch(console.error);

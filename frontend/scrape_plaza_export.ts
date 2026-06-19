import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://vallearriba.elplazas.com';

const categories = [
  { url: '/frutas-y-vegetales.html' },
  { url: '/refrigerados-y-congelados/carnes-aves-y-pescado.html' },
  { url: '/refrigerados-y-congelados/charcuteria.html' },
  { url: '/viveres/arroz-granos-y-pastas.html' },
  { url: '/viveres/bebidas.html' },
  { url: '/viveres/snacks.html' },
  { url: '/viveres/galletas.html' },
  { url: '/limpieza.html' },
  { url: '/cuidado-personal-y-salud.html' }
];

const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const EXPORT_DIR = path.join(process.cwd(), 'Inventario_Plaza_Export');
const OUTPUT_CSV = path.join(EXPORT_DIR, `Inventario_Actualizado_${dateStr}.csv`);

// Agregamos BOM para UTF-8 en Excel
const UTF8_BOM = '\uFEFF';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scrape() {
  if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`Creando carpeta ${EXPORT_DIR}...`);
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }

  let products: string[] = [];
  let idCounter = 1;
  
  // Header compatible con el Panel Admin y Google Sheets
  const csvHeader = '"id";"nombre";"descripcion";"precio";"categoria";"imagen";"url_producto";"imagen_incrustada"\n';
  
  console.log('Iniciando extracción del catálogo...');

  for (const cat of categories) {
    console.log(`\nNavegando a categoría: ${cat.url}`);
    let categoryName = cat.url.split('/')[1].replace('.html', ''); // Ej: frutas-y-vegetales
    
    try {
      let page = 1;
      let hasMoreProducts = true;
      
      while (hasMoreProducts && page <= 5) {
        const pageUrl = `${BASE_URL}${cat.url}?p=${page}`;
        console.log(`  -> Extrayendo página ${page}: ${pageUrl}`);
        
        const res = await axios.get(pageUrl);
        const $ = cheerio.load(res.data);

        const items = $('.item.product.product-item');
        if (items.length === 0) {
            hasMoreProducts = false;
            break;
        }

        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          
          // ID generado
          const id = `p${idCounter++}`;

          // Nombre
          const rawName = $(el).find('.product-item-link').text().trim();
          const name = rawName.replace(/"/g, '""');
          
          // Descripción
          const descEl = $(el).find('.product-item-description').text().trim();
          const description = descEl ? descEl.replace(/"/g, '""') : '';
          
          // Precio
          let priceText = $(el).find('.price').first().text().trim();
          let price = priceText.replace(/[^0-9,.]/g, ''); 
          if (price.includes(',') && price.includes('.')) {
              price = price.replace(/\./g, '').replace(',', '.');
          } else if (price.includes(',')) {
              price = price.replace(',', '.');
          }
          if (!price) price = "0.00";
          
          // URLs
          const imgUrl = $(el).find('.product-image-photo').attr('src') || '';
          const productUrl = $(el).find('.product-item-link').attr('href') || '';
          
          if (name && imgUrl && !imgUrl.includes('placeholder')) {
              const imageFormula = `=IMAGE("${imgUrl}", 1)`;
              
              // Export using semicolons (;) so it matches the Admin Panel requirements
              products.push(`"${id}";"${name}";"${description}";"${price}";"${categoryName}";"${imgUrl}";"${productUrl}";"${imageFormula}"`);
          }
        }
        
        page++;
        await sleep(1500); // Reducido para mayor agresividad
      }
    } catch (e: any) {
      console.error(`  [ERROR] Falló la extracción en ${cat.url}: ${e.message}`);
    }
  }

  console.log(`\nExtracción finalizada. Procesando y guardando datos...`);
  const csvContent = UTF8_BOM + csvHeader + products.join('\n');
  fs.writeFileSync(OUTPUT_CSV, csvContent, 'utf8');
  console.log(`¡Éxito! ${products.length} productos guardados correctamente en:\n-> ${OUTPUT_CSV}`);
}

scrape().catch(console.error);

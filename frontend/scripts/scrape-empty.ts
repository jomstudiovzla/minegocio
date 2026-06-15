import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, writeBatch, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ananas-market-ve-ddb93",
  appId: "1:760091165460:web:4a9c75b5140d31939bf801",
  storageBucket: "ananas-market-ve-ddb93.firebasestorage.app",
  apiKey: "AIzaSyB2yrUnwoAMA55ov-k0GeojC6mEEpUlYhI",
  authDomain: "ananas-market-ve-ddb93.firebaseapp.com",
  messagingSenderId: "760091165460",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const publicDir = path.join(process.cwd(), 'public', 'images', 'products', 'scraped');

// Vamos a sacar productos genéricos de las categorías principales y los asignamos a las subcategorías vacías
const targets = [
  { url: 'https://vallearriba.elplazas.com/refrigerados-y-congelados.html', cat: 'refrigerados-congelados', subs: ['Quesos'] },
  { url: 'https://vallearriba.elplazas.com/cuidado-personal-y-salud.html', cat: 'cuidado-personal-salud', subs: ['Cuidado corporal'] },
  { url: 'https://vallearriba.elplazas.com/limpieza.html', cat: 'limpieza', subs: ['Baño', 'Desinfección', 'Accesorios de limpieza'] },
  { url: 'https://vallearriba.elplazas.com/licores.html', cat: 'licores', subs: ['Rones', 'Whisky'] }
];

async function downloadImage(url: string, filepath: string) {
  if (url.includes('placeholder')) return false;
  try {
    const response = await axios({
      url, method: 'GET', responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error: any = null;
      writer.on('error', err => { error = err; writer.close(); reject(err); });
      writer.on('close', () => { if (!error) resolve(true); });
    });
  } catch (err: any) {
    console.error(`Error downloading ${url}: ${err.message}`);
    return false;
  }
}

async function scrape() {
  const newProducts: any[] = [];
  const batch = writeBatch(db);

  for (const target of targets) {
    console.log(`Scrapeando categoría principal: ${target.url}`);
    try {
      const { data } = await axios.get(target.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      const productElements = $('.item.product.product-item');
      
      let elIndex = 0;
      for (const sub of target.subs) {
        console.log(` Asignando 5 productos a la subcategoría: ${sub}`);
        let count = 0;
        
        while (count < 5 && elIndex < productElements.length) {
          const el = productElements[elIndex++];
          const name = $(el).find('.product.name.product-item-name a').text().trim() || 'Producto Sin Nombre';
          const priceText = $(el).find('.price').first().text().trim();
          const priceMatches = priceText.match(/[\d,.]+/);
          let price = priceMatches ? parseFloat(priceMatches[0].replace(',', '.')) : 2.99;
          
          let imageUrl = $(el).find('.product-image-photo').attr('src') || '';
          const idMatches = imageUrl.match(/\/(\d+)\./);
          const uniqueId = idMatches ? idMatches[1] + count + sub.length : Date.now().toString() + Math.floor(Math.random()*1000);
          
          if (imageUrl.includes('placeholder')) continue;

          const product = {
            id: `p-plazas-filled-${uniqueId}`,
            name,
            price,
            category: target.cat,
            subcategory: sub,
            image: imageUrl,
            unit: "1 Un",
            labels: ["Nuevo"],
            stock: Math.floor(Math.random() * 50) + 10,
            warehouseStock: Math.floor(Math.random() * 200) + 50,
            providerPrice: parseFloat((price * 0.7).toFixed(2)),
            description: `${name} de alta calidad, garantizado por Automercados Plazas.`
          };

          const extMatch = product.image.match(/\.(jpg|jpeg|png)$/i);
          const ext = extMatch ? extMatch[0] : '.jpg';
          const filename = `${product.id}${ext}`;
          const filepath = path.join(publicDir, filename);
          
          const success = await downloadImage(product.image, filepath);
          if (success) {
            product.image = `/Ananas/images/products/scraped/${filename}`;
            newProducts.push(product);
            batch.set(doc(db, 'products', product.id), product);
            count++;
          }
        }
      }
    } catch (err: any) {
      console.error(`Error scrapeando ${target.url}: ${err.message}`);
    }
  }

  console.log(`Se obtuvieron ${newProducts.length} productos de relleno.`);
  console.log('Subiendo a Firebase...');
  await batch.commit();

  console.log('Generando mockDb.ts...');
  const snap = await getDocs(collection(db, "products"));
  const allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const mockDbPath = path.join(__dirname, '../src/data/mockDb.ts');
  let mockDbContent = fs.readFileSync(mockDbPath, 'utf8');
  const productsIndex = mockDbContent.indexOf('export const products: Product[] = [');
  if (productsIndex !== -1) {
    const topPart = mockDbContent.substring(0, productsIndex);
    const newProductsContent = `export const products: Product[] = ${JSON.stringify(allProducts, null, 2)};\n`;
    fs.writeFileSync(mockDbPath, topPart + newProductsContent);
    console.log(`mockDb.ts sincronizado con ${allProducts.length} productos en total.`);
  }

  console.log('Proceso Finalizado.');
}

scrape().catch(console.error);

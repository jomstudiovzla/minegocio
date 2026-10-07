/**
 * frontend/download_images.ts
 * Descargador seguro, concurrente e idempotente de catálogo para Mi Negocio.
 * Compatible con tsx: npx tsx download_images.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as Papa from 'papaparse';

// -------------------- CONFIGURACIÓN --------------------
const IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'products', 'scraped');
const CSV_CANDIDATES = [
  path.join(process.cwd(), 'public', 'data', 'productos_plantilla.csv'),
  path.join(process.cwd(), 'public', 'data', 'inventario_extenso.csv'),
  path.join(process.cwd(), 'scrapedProducts.csv')
];

const CONCURRENCY = 6;
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 3;

// Whitelist estricta de orígenes permitidos (SSRF Prevention)
const WHITELISTED_DOMAINS = new Set([
  'vallearriba.elplazas.com',
  'elplazas.com',
  'firebasestorage.googleapis.com',
  'images.unsplash.com'
]);

// -------------------- TIPOS Y UTILIDADES --------------------
interface RawProductRow {
  id?: string;
  sku?: string;
  imagen?: string;
  image?: string;
  url_producto?: string;
  [key: string]: any;
}

function sanitizeFileName(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

function isValidImageUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isWhitelisted(hostname: string): boolean {
  for (const domain of WHITELISTED_DOMAINS) {
    if (hostname === domain || hostname.endsWith('.' + domain)) return true;
  }
  return false;
}

/** Valida Magic Numbers de los formatos de imagen más comunes */
function validateMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng  = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // 'RIFF'
  const isGif  = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46; // 'GIF'
  return isJpeg || isPng || isWebp || isGif;
}

/** Concurrencia limitada nativa (Zero-Dependencies) */
async function asyncPool<T>(poolLimit: number, array: T[], iteratorFn: (item: T) => Promise<any>): Promise<void> {
  const executing: Promise<any>[] = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    executing.push(p);
    const clean = () => {
      const idx = executing.indexOf(p);
      if (idx !== -1) executing.splice(idx, 1);
    };
    p.then(clean).catch(clean);
    if (executing.length >= poolLimit) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
}

// -------------------- DESCARGA CON REINTENTOS --------------------
async function downloadSingleImage(row: RawProductRow): Promise<void> {
  const rawId = row.id || row.sku;
  const rawUrl = row.imagen || row.image || row.url_producto;

  if (!rawId || !rawUrl) return;

  // Si ya es una ruta relativa local, no hay nada que descargar
  if (rawUrl.startsWith('/') || !rawUrl.startsWith('http')) return;

  if (!isValidImageUrl(rawUrl)) {
    console.warn(`[WARN] URL malformada ignorada para ID ${rawId}: ${rawUrl}`);
    return;
  }

  const parsedUrl = new URL(rawUrl);
  if (!isWhitelisted(parsedUrl.hostname)) {
    console.warn(`[SSRF BLOCK] Dominio no autorizado: ${parsedUrl.hostname} (ID: ${rawId})`);
    return;
  }

  const safeId = sanitizeFileName(rawId);
  const ext = path.extname(parsedUrl.pathname).toLowerCase() || '.jpg';
  const destPath = path.join(IMAGE_DIR, `${safeId}${ext}`);

  // Idempotencia: omitir si ya existe y no está vacío
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1024) {
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios({
        url: rawUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: TIMEOUT_MS,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Referer': `${parsedUrl.protocol}//${parsedUrl.hostname}/` // Evita bloqueo anti-hotlinking
        }
      });

      const contentType = response.headers['content-type'];
      if (contentType && !String(contentType).startsWith('image/')) {
        throw new Error(`Content-Type inválido: ${contentType}`);
      }

      const buffer = Buffer.from(response.data);
      if (!validateMagicBytes(buffer)) {
        throw new Error('Firma de archivo inválida (Magic Bytes no corresponden a imagen)');
      }

      // Guardar con permisos 0o644 (Lectura pública para servidor web)
      fs.writeFileSync(destPath, buffer, { mode: 0o644 });
      console.info(`[OK] Descargado: ${safeId}${ext}`);
      return;
    } catch (err: any) {
      if (attempt === MAX_RETRIES) {
        console.error(`[FAIL] Falló ${safeId} tras ${MAX_RETRIES} intentos: ${err.message}`);
      } else {
        await new Promise(r => setTimeout(r, 600 * attempt));
      }
    }
  }
}

// -------------------- ORQUESTADOR PRINCIPAL --------------------
async function main() {
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true, mode: 0o755 });
  }

  const csvPath = CSV_CANDIDATES.find(p => fs.existsSync(p));
  if (!csvPath) {
    console.error('❌ No se encontró ningún archivo CSV de inventario.');
    process.exit(1);
  }

  console.info(`📂 Leyendo catálogo desde: ${path.basename(csvPath)}`);
  const rawCsv = fs.readFileSync(csvPath, 'utf8');

  // Detección automática de delimitador (; o ,)
  let parsed = Papa.parse(rawCsv, { header: true, delimiter: ';', skipEmptyLines: true });
  if (parsed.data.length < 5) {
    parsed = Papa.parse(rawCsv, { header: true, delimiter: ',', skipEmptyLines: true });
  }

  const rows = parsed.data as RawProductRow[];
  console.info(`🚀 Procesando ${rows.length} productos con concurrencia ${CONCURRENCY}...`);

  await asyncPool(CONCURRENCY, rows, downloadSingleImage);
  console.info('🎉 Proceso de descarga de imágenes concluido exitosamente.');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});

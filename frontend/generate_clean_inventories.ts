import fs from 'fs';
import path from 'path';
import * as Papa from 'papaparse';

const CSV_PATH_1 = path.join(__dirname, 'public', 'data', 'productos_plantilla.csv');
const CSV_PATH_2 = path.join(__dirname, 'scrapedProducts.csv');
const REDUCIDO_PATH = path.join(__dirname, 'public', 'data', 'inventario_reducido.csv');
const EXTENSO_PATH = path.join(__dirname, 'public', 'data', 'inventario_extenso.csv');

function run() {
  let allRows: any[] = [];

  // Read first file (595 products)
  if (fs.existsSync(CSV_PATH_1)) {
    const csvData1 = fs.readFileSync(CSV_PATH_1, 'utf8');
    let parsed1 = Papa.parse(csvData1, { header: true, delimiter: ';' });
    if (parsed1.data.length < 10) {
      parsed1 = Papa.parse(csvData1, { header: true, delimiter: ',' });
    }
    allRows = allRows.concat(parsed1.data);
  }

  // Read second file (75 products with licores)
  if (fs.existsSync(CSV_PATH_2)) {
    const csvData2 = fs.readFileSync(CSV_PATH_2, 'utf8');
    let parsed2 = Papa.parse(csvData2, { header: true, delimiter: ',' });
    if (parsed2.data.length < 10) {
      parsed2 = Papa.parse(csvData2, { header: true, delimiter: ';' });
    }
    allRows = allRows.concat(parsed2.data);
  }

  const rows: any[] = allRows.filter((r: any) => r.id && (r.name || r.nombre));

  // Map to correct mockDb categories
  const categoryMap: Record<string, string> = {
    'frutas-y-vegetales': 'frutas-vegetales',
    'refrigerados-y-congelados': 'refrigerados-congelados',
    'cuidado-personal-y-salud': 'cuidado-personal-salud',
    'viveres': 'viveres',
    'limpieza': 'limpieza',
    'licores': 'licores',
    'charcuteria': 'refrigerados-congelados',
    'carnes': 'refrigerados-congelados',
  };

  rows.forEach(row => {
    row.nombre = row.name || row.nombre || '';
    row.descripcion = row.description || row.descripcion || '';
    row.precio = row.price || row.precio || '0';
    
    let cat = (row.category || row.categoria || '').toLowerCase().trim();
    if (categoryMap[cat]) {
      row.categoria = categoryMap[cat];
    } else {
      row.categoria = 'viveres'; // Fallback
    }
    
    row.subcategoria = row.subcategory || row.subcategoria || row.categoria;

    // Local path so it works in localhost without needing the github pages deployment
    row.imagen = `/images/products/scraped/${row.id}.jpg`;

    // Asegurar stock
    row.stock = "100";
    row.warehouseStock = "50";
    
    delete row.name;
    delete row.description;
    delete row.price;
    delete row.category;
    delete row.subcategory;
    delete row.image;
    delete row.unit;
    delete row.providerPrice;
    delete row.originalImageUrl;
  });

  const porCategoria: Record<string, any[]> = {
    'frutas-vegetales': [],
    'refrigerados-congelados': [],
    'viveres': [],
    'cuidado-personal-salud': [],
    'limpieza': [],
    'licores': []
  };

  rows.forEach(row => {
    const cat = row.categoria;
    if (porCategoria[cat]) {
      porCategoria[cat].push(row);
    } else {
      porCategoria['viveres'].push(row);
    }
  });

  const validSubcategories: Record<string, string[]> = {
    "frutas-vegetales": [ "Frutas", "Verduras y hortalizas", "Tubérculos", "Verdes y hojas" ],
    "refrigerados-congelados": [ "Carnes", "Pollo", "Charcutería", "Quesos", "Congelados listos" ],
    "viveres": [ "Granos", "Arroz y pasta", "Enlatados", "Aceites y salsas", "Bebidas" ],
    "cuidado-personal-salud": [ "Higiene personal", "Cuidado corporal", "Farmacia básica" ],
    "limpieza": [ "Ropa", "Cocina", "Baño", "Desinfección", "Accesorios de limpieza" ],
    "licores": [ "Cervezas", "Rones", "Whisky", "Vinos", "Otros destilados" ]
  };

  const reducidoRows: any[] = [];
  const extensoRows: any[] = [];

  for (const cat of Object.keys(porCategoria)) {
    let items = porCategoria[cat];
    // Filter duplicates just in case
    const seen = new Set();
    items = items.filter(i => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    const subs = validSubcategories[cat] || [cat];
    
    // Asignar subcategoría uniformemente (o inferir por nombre si es obvio)
    items.forEach((item, index) => {
        let assigned = subs[index % subs.length];
        const nameUpper = item.nombre.toUpperCase();
        if (cat === 'licores') {
            if (nameUpper.includes('CERVEZA')) assigned = 'Cervezas';
            else if (nameUpper.includes('RON')) assigned = 'Rones';
            else if (nameUpper.includes('WHISKY') || nameUpper.includes('CAROREÑA')) assigned = 'Whisky';
        }
        item.subcategoria = assigned;
    });

    // Sort so subcategories are somewhat grouped
    items.sort((a, b) => a.subcategoria.localeCompare(b.subcategoria));

    reducidoRows.push(...items.slice(0, 15));
    extensoRows.push(...items.slice(0, 35));
  }

  // Reasignar un ID unificado a todos los productos seleccionados (ej: PRD-001, PRD-002...)
  // extensoRows contiene todos los productos (los de reducidoRows son un subconjunto de estos).
  extensoRows.forEach((r, idx) => {
    // Solo cambiamos el ID, la propiedad r.imagen ya tiene guardada la ruta original de la foto.
    r.id = `PRD-${(idx + 1).toString().padStart(3, '0')}`;
  });

  // Generar CSVs
  reducidoRows.forEach(r => {
     r.imagen_incrustada = `=IMAGE("https://jomstudiovzla.github.io/minegocio${r.imagen}", 1)`;
  });
  extensoRows.forEach(r => {
     r.imagen_incrustada = `=IMAGE("https://jomstudiovzla.github.io/minegocio${r.imagen}", 1)`;
  });

  const csvReducido = Papa.unparse(reducidoRows, { delimiter: ';' });
  const csvExtenso = Papa.unparse(extensoRows, { delimiter: ';' });

  fs.writeFileSync(REDUCIDO_PATH, csvReducido, 'utf8');
  fs.writeFileSync(EXTENSO_PATH, csvExtenso, 'utf8');

  console.log(`Creado inventario reducido (${reducidoRows.length} items) -> ${REDUCIDO_PATH}`);
  console.log(`Creado inventario extenso (${extensoRows.length} items) -> ${EXTENSO_PATH}`);
}

run();

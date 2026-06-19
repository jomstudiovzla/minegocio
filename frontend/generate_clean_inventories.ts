import fs from 'fs';
import path from 'path';
import * as Papa from 'papaparse';

const CSV_PATH = path.join(__dirname, 'public', 'data', 'productos_plantilla.csv');
const REDUCIDO_PATH = path.join(__dirname, 'public', 'data', 'inventario_reducido.csv');
const EXTENSO_PATH = path.join(__dirname, 'public', 'data', 'inventario_extenso.csv');

function run() {
  const csvData = fs.readFileSync(CSV_PATH, 'utf8');
  let parsed = Papa.parse(csvData, { header: true, delimiter: ';' });
  if (parsed.data.length < 10) {
      parsed = Papa.parse(csvData, { header: true, delimiter: ',' });
  }

  const rows: any[] = parsed.data.filter((r: any) => r.id && r.nombre);

  // Normalizar y arreglar los datos base
  rows.forEach(row => {
    // Asegurar imagen
    if (row.imagen && row.imagen.includes('jomstudiovzla.github.io')) {
      // Las dejamos tal cual, o las convertimos en rutas relativas limpias
      row.imagen = `/images/products/scraped/${row.id}.jpg`;
    } else if (!row.imagen) {
       row.imagen = `/images/products/scraped/p1.jpg`; // Fallback
    }

    // Asegurar stock
    row.stock = "100";
    row.warehouseStock = "50";

    // Si no tiene subcategoría, hereda de categoría para agrupar
    if (!row.subcategoria) {
      row.subcategoria = row.categoria || "Varios";
    }
  });

  // Agrupar por subcategoria
  const porSubcategoria: Record<string, any[]> = {};
  rows.forEach(row => {
    const sub = (row.subcategoria || row.categoria || "Varios").trim();
    if (!porSubcategoria[sub]) porSubcategoria[sub] = [];
    porSubcategoria[sub].push(row);
  });

  const reducidoRows: any[] = [];
  const extensoRows: any[] = [];

  for (const sub of Object.keys(porSubcategoria)) {
    const items = porSubcategoria[sub];
    
    // Hasta 15 para reducido
    reducidoRows.push(...items.slice(0, 15));
    
    // Hasta 35 para extenso
    extensoRows.push(...items.slice(0, 35));
  }

  // Generar CSVs (eliminando imagen_incrustada si no la necesitamos para no enredar el CSV final local, o la dejamos)
  // Re-agregamos la formula para Excel/Sheets pero apuntando al dominio de github para que siempre se vea en Excel
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
  
  // Limpiar el original
  fs.unlinkSync(CSV_PATH);
  console.log(`Eliminado CSV temporal: ${CSV_PATH}`);
}

run();

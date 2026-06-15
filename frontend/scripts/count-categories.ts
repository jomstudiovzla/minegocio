import fs from 'fs';
import path from 'path';

function run() {
  const mockDbPath = path.join(__dirname, '../src/data/mockDb.ts');
  const mockDbContent = fs.readFileSync(mockDbPath, 'utf8');
  
  // Extraer products
  const productsMatch = mockDbContent.match(/export const products:\s*Product\[\]\s*=\s*(\[[\s\S]*?\]);\n/);
  // Extraer categories
  const categoriesMatch = mockDbContent.match(/export const categories:\s*Category\[\]\s*=\s*(\[[\s\S]*?\]);\n/);
  
  if (!productsMatch || !categoriesMatch) {
    console.error("No se encontraron categories o products");
    return;
  }
  
  const products = JSON.parse(productsMatch[1]);
  const categories = JSON.parse(categoriesMatch[1]);
  
  const report: any = {};
  
  categories.forEach((cat: any) => {
    report[cat.id] = { total: 0, subcategories: {} };
    if (cat.subcategories) {
      cat.subcategories.forEach((sub: string) => {
        report[cat.id].subcategories[sub] = 0;
      });
    }
  });
  
  products.forEach((p: any) => {
    if (report[p.category]) {
      report[p.category].total++;
      if (p.subcategory && report[p.category].subcategories[p.subcategory] !== undefined) {
        report[p.category].subcategories[p.subcategory]++;
      } else {
        // Subcategoria desconocida
        report[p.category].subcategories[p.subcategory || 'UNKNOWN'] = (report[p.category].subcategories[p.subcategory || 'UNKNOWN'] || 0) + 1;
      }
    }
  });
  
  console.log("=== REPORTE DE INVENTARIO ===");
  for (const [catId, data] of Object.entries(report)) {
    console.log(`\nCategoría: ${catId} (Total: ${(data as any).total})`);
    for (const [sub, count] of Object.entries((data as any).subcategories)) {
      console.log(`  - ${sub}: ${count}`);
    }
  }
}

run();

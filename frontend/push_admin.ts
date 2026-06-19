import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

admin.initializeApp({
  projectId: "mi-negocio-38233"
});

const db = admin.firestore();

async function upload() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'productos_plantilla.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',');

    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < headers.length) continue;

      products.push({
        id: cols[0],
        name: cols[1],
        price: parseFloat(cols[2] || '0'),
        category: cols[3],
        subcategory: cols[4],
        image: cols[5],
        unit: cols[6],
        labels: cols[7] ? cols[7].split('|') : [],
        description: cols[8],
        providerPrice: parseFloat(cols[9] || '0'),
        stock: parseInt(cols[10] || '0', 10),
        warehouseStock: parseInt(cols[11] || '0', 10),
        isActive: true,
        views: 0,
        sales: 0
      });
    }

    console.log(`Subiendo ${products.length} productos con ADMIN SDK...`);
    const batch = db.batch();
    products.forEach(p => {
      const docRef = db.collection('products').doc(p.id);
      batch.set(docRef, p);
    });

    await batch.commit();
    console.log("¡Éxito!");
  } catch (error) {
    console.error("Error:", error);
  }
}

upload();

import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';

const firebaseConfig = {
  projectId: "minegocio2-c20ef",
  appId: "1:17384818092:web:1a266b8d3cbb7bf4bae609",
  storageBucket: "minegocio2-c20ef.firebasestorage.app",
  apiKey: "AIzaSyDk0ScqYYFy589FQyRWNw53En8iXMwSafA",
  authDomain: "minegocio2-c20ef.firebaseapp.com",
  messagingSenderId: "17384818092",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function upload() {
  try {
    console.log("Iniciando sesión como admin...");
    try {
      await signInWithEmailAndPassword(auth, 'admin@jomstudio.com', 'VZLA123');
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
        console.log("Creando admin...");
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, 'admin@jomstudio.com', 'VZLA123');
      } else {
        throw e;
      }
    }
    console.log("Sesión iniciada exitosamente.");

    const csvPath = path.join(process.cwd(), 'public', 'data', 'productos_plantilla.csv');
    if (!fs.existsSync(csvPath)) {
      console.log("No se encontró el archivo:", csvPath);
      process.exit(1);
    }

    const csvData = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse(csvData, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
    });

    const products = [];
    for (const row of parsed.data as any[]) {
      if (!row.id) continue;
      products.push({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price || '0'),
        category: row.category,
        subcategory: row.subcategory,
        image: row.image,
        unit: row.unit,
        labels: row.labels ? row.labels.split('|') : [],
        description: row.description || '',
        providerPrice: parseFloat(row.providerPrice || '0'),
        stock: parseInt(row.stock || '0', 10),
        warehouseStock: parseInt(row.warehouseStock || '0', 10),
        isActive: true,
        views: 0,
        sales: 0
      });
    }

    console.log(`Encontrados ${products.length} productos. Borrando antiguos y subiendo a Firestore...`);
    
    // Clean old products first
    const snapshot = await getDocs(collection(db, 'products'));
    for (const d of snapshot.docs) {
      await deleteDoc(d.ref);
    }
    console.log(`Borrados ${snapshot.docs.length} productos antiguos.`);

    // Batch upload in chunks of 500
    let batch = writeBatch(db);
    let count = 0;
    
    for (const p of products) {
      const docRef = doc(db, 'products', p.id);
      batch.set(docRef, p);
      count++;
      
      if (count % 400 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }

    if (count % 400 !== 0) {
      await batch.commit();
    }
    
    console.log("¡Productos subidos exitosamente a Firestore!");
    process.exit(0);

  } catch (error) {
    console.error("Error crítico:", error);
    process.exit(1);
  }
}

upload();

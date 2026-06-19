import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';

const firebaseConfig = {
  projectId: "mi-negocio-38233",
  appId: "1:760091165460:web:4a9c75b5140d31939bf801",
  storageBucket: "mi-negocio-38233.firebasestorage.app",
  apiKey: "AIzaSyB2yrUnwoAMA55ov-k0GeojC6mEEpUlYhI",
  authDomain: "mi-negocio-38233.firebaseapp.com",
  messagingSenderId: "760091165460",
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

    // Parse CSV manually since this is a simple script
    const csvPath = path.join(process.cwd(), 'public', 'data', 'productos_plantilla.csv');
    if (!fs.existsSync(csvPath)) {
      console.log("No se encontró el archivo:", csvPath);
      process.exit(1);
    }

    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',');

    const products = [];
    for (let i = 1; i < lines.length; i++) {
      // Split by comma, naive approach (assuming no commas in strings for this specific template)
      // Actually let's use a regex to split by comma outside quotes if needed, but our template has no quotes.
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
        isActive: true, // required by schema
        views: 0,
        sales: 0
      });
    }

    console.log(`Encontrados ${products.length} productos. Subiendo a Firestore...`);
    
    const batch = writeBatch(db);
    products.forEach(p => {
      const docRef = doc(db, 'products', p.id);
      batch.set(docRef, p);
    });

    await batch.commit();
    console.log("¡Productos subidos exitosamente a Firestore!");
    process.exit(0);

  } catch (error) {
    console.error("Error crítico:", error);
    process.exit(1);
  }
}

upload();

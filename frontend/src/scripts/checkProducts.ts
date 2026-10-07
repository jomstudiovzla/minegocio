/**
 * Cuenta los productos del catálogo real de Mi Negocio.
 *     npx tsx src/scripts/checkProducts.ts
 */
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

// Misma configuración que src/lib/firebase.ts
const app = initializeApp({
  projectId: 'minegocio2-c20ef',
  appId: '1:17384818092:web:1a266b8d3cbb7bf4bae609',
  apiKey: 'AIzaSyDk0ScqYYFy589FQyRWNw53En8iXMwSafA',
  authDomain: 'minegocio2-c20ef.firebaseapp.com',
});
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'products'));
  const withoutCost = snapshot.docs.filter(d => !(Number(d.data().providerPrice) > 0)).length;
  const outOfStock = snapshot.docs.filter(d => (Number(d.data().stock) || 0) + (Number(d.data().warehouseStock) || 0) === 0).length;
  console.log(`Hay ${snapshot.size} productos en Firebase (minegocio2-c20ef).`);
  console.log(`  · ${withoutCost} sin costo de proveedor`);
  console.log(`  · ${outOfStock} sin unidades en tienda ni depósito`);
  process.exit(0);
}

check().catch(error => {
  console.error(error);
  process.exit(1);
});

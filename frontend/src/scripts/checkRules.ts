/**
 * Mi Negocio — Comprobación rápida de las reglas de Firestore EN PRODUCCIÓN.
 *
 * Ejecutar después de `firebase deploy --only firestore:rules`:
 *     npm run check:rules
 *
 * Se conecta SIN sesión (como cualquier visitante) al proyecto real de la tienda
 * y comprueba qué puede y qué no puede hacer. No modifica datos: el único
 * intento de escritura sobre un producto reescribe el mismo precio que ya tiene.
 */
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, setDoc, updateDoc } from 'firebase/firestore';

// Misma configuración que src/lib/firebase.ts
const app = initializeApp({
  projectId: 'minegocio2-c20ef',
  appId: '1:17384818092:web:1a266b8d3cbb7bf4bae609',
  storageBucket: 'minegocio2-c20ef.firebasestorage.app',
  apiKey: 'AIzaSyDk0ScqYYFy589FQyRWNw53En8iXMwSafA',
  authDomain: 'minegocio2-c20ef.firebaseapp.com',
  messagingSenderId: '17384818092',
});
const db = getFirestore(app);

type Expectation = 'permitido' | 'denegado';
let failures = 0;

async function check(name: string, expected: Expectation, action: () => Promise<unknown>) {
  let actual: Expectation;
  try {
    await action();
    actual = 'permitido';
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== 'permission-denied') {
      console.log(`  ?  ${name}: error inesperado (${code ?? error})`);
      failures++;
      return;
    }
    actual = 'denegado';
  }
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'}  ${name}: ${actual}${ok ? '' : `  ← debería estar ${expected}`}`);
}

async function main() {
  console.log('Reglas de Firestore vistas por un visitante sin sesión:\n');

  const sample = await getDocs(query(collection(db, 'products'), limit(1)));
  await check('leer el catálogo', 'permitido', async () => sample);
  await check('leer datos de cobro (store/paymentConfig)', 'permitido', () => getDoc(doc(db, 'store', 'paymentConfig')));

  // La escritura sobre el catálogo reescribe el MISMO precio: si las reglas viejas
  // siguen activas, el dato no cambia. Solo si esa prueba sale denegada (reglas
  // nuevas desplegadas) se intenta crear un producto, que entonces no puede crearse.
  let catalogClosed = false;
  if (sample.empty) {
    console.log('  ·  No hay productos: se omiten las pruebas de escritura del catálogo.');
  } else {
    const product = sample.docs[0];
    const before = failures;
    await check('cambiar el precio de un producto', 'denegado', () => updateDoc(product.ref, { price: product.data().price }));
    catalogClosed = failures === before;
  }
  if (catalogClosed) {
    await check('crear un producto', 'denegado', () => setDoc(doc(db, 'products', 'ZZ-PRUEBA-REGLAS'), { id: 'ZZ-PRUEBA-REGLAS', name: 'x', price: 1 }));
  } else if (!sample.empty) {
    console.log('  ·  El catálogo sigue abierto: no se prueba crear un producto para no ensuciar la base.');
  }
  await check('leer todos los pedidos', 'denegado', () => getDocs(query(collection(db, 'orders'), limit(1))));
  await check('crear un pedido sin sesión', 'denegado', () => setDoc(doc(db, 'orders', 'MINE-000000'), { id: 'MINE-000000', status: 'Facturado', total: 0 }));
  await check('leer el registro del panel', 'denegado', () => getDocs(query(collection(db, 'adminLogs'), limit(1))));
  await check('leer las fichas de clientes', 'denegado', () => getDocs(query(collection(db, 'users'), limit(1))));
  await check('cambiar los datos de cobro', 'denegado', () => setDoc(doc(db, 'store', 'paymentConfig'), { cash: { enabled: true } }));
  await check('leer capturas de pago', 'denegado', () => getDocs(query(collection(db, 'paymentProofs'), limit(1))));
  await check('leer movimientos de almacén', 'denegado', () => getDocs(query(collection(db, 'stockMovements'), limit(1))));
  await check('leer notas internas de clientes', 'denegado', () => getDocs(query(collection(db, 'customerNotes'), limit(1))));

  console.log(failures === 0 ? '\nTodo como debe estar.' : `\n${failures} comprobación(es) fallaron: despliega firestore.rules y vuelve a ejecutar.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(error => {
  console.error('No se pudo conectar con Firebase:', error);
  process.exit(1);
});

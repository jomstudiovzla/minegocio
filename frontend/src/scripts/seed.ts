import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { products } from "../data/mockDb";

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

async function seed() {
  console.log("Iniciando migración de productos a Firebase...");
  try {
    for (const product of products) {
      await setDoc(doc(db, "products", product.id), product);
      console.log(`✅ Producto subido: ${product.name}`);
    }
    console.log("¡Migración completada con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("Error migrando productos:", error);
    process.exit(1);
  }
}

seed();

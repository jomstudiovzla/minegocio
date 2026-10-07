import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import {
  type Auth,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "minegocio2-c20ef",
  appId: "1:17384818092:web:1a266b8d3cbb7bf4bae609",
  storageBucket: "minegocio2-c20ef.firebasestorage.app",
  apiKey: "AIzaSyDk0ScqYYFy589FQyRWNw53En8iXMwSafA",
  authDomain: "minegocio2-c20ef.firebaseapp.com",
  messagingSenderId: "17384818092",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

// La sesión DEBE sobrevivir a recargas y a abrir otra pestaña: por eso se fija
// la persistencia local de forma explícita en vez de confiar en el valor por
// defecto. Se intenta IndexedDB y, si el navegador no lo permite (modo privado,
// Safari con almacenamiento bloqueado), se cae a localStorage y luego a la
// sesión de la pestaña. Sin esto, el usuario inicia sesión y al volver parece
// que nunca entró.
function resolveAuth(): Auth {
  // En el prerenderizado (next build / SSG) no hay navegador: getAuth basta.
  if (typeof window === "undefined") return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    // Ya estaba inicializado (p. ej. Fast Refresh en desarrollo): se reutiliza.
    return getAuth(app);
  }
}

const auth = resolveAuth();
const storage = getStorage(app);
// Si Storage no está activado en el proyecto, que falle rápido: el checkout
// tiene un respaldo y no debe dejar al cliente esperando minutos.
storage.maxUploadRetryTime = 12_000;
storage.maxOperationRetryTime = 12_000;

export { app, db, auth, storage };

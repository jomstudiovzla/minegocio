import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const auth = getAuth(app);

export { app, db, auth };

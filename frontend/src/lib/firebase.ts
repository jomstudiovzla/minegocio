import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "mi-negocio-38233",
  appId: "1:760091165460:web:4a9c75b5140d31939bf801",
  storageBucket: "mi-negocio-38233.firebasestorage.app",
  apiKey: "AIzaSyB2yrUnwoAMA55ov-k0GeojC6mEEpUlYhI",
  authDomain: "mi-negocio-38233.firebaseapp.com",
  messagingSenderId: "760091165460",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
const auth = getAuth(app);

export { app, db, auth };

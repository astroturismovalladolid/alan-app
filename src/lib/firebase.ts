
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Firebase config is set via next.config.ts from FIREBASE_WEBAPP_CONFIG or local env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if we have valid Firebase config (not placeholder values from .env.local)
const hasValidConfig = firebaseConfig.apiKey &&
                        firebaseConfig.apiKey !== 'your-api-key-here' &&
                        firebaseConfig.projectId &&
                        firebaseConfig.projectId !== 'your-project-id';

// Initialize Firebase only if we have valid config (avoid build errors with placeholder credentials)
// During build time with invalid credentials, Firebase will not be initialized
const app = hasValidConfig && !getApps().length ? initializeApp(firebaseConfig) : (hasValidConfig ? getApp() : null);
const db = app ? getFirestore(app) : null as any;
const storage = app ? getStorage(app) : null as any;
const auth = app ? getAuth(app) : null as any;
const googleProvider = app ? new GoogleAuthProvider() : null as any;

// Force account selection on every login (only if googleProvider exists)
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

export { app, db, storage, auth, googleProvider };

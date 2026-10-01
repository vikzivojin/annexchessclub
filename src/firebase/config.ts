import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Values come from a .env.local file that is never committed (see
// .env.example). Copy the firebaseConfig object from Project settings >
// Your apps in the Firebase console into .env.local, then restart the dev
// server so Vite picks up the new variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0 && import.meta.env.DEV) {
  // Surface a clear message instead of a cryptic Firebase error when
  // .env.local hasn't been set up yet.
  // eslint-disable-next-line no-console
  console.warn(
    `Firebase config is missing values for: ${missingKeys.join(", ")}. ` +
      "Copy .env.example to .env.local and fill in your Firebase project's config.",
  );
}

// Avoid re-initializing on hot reload.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

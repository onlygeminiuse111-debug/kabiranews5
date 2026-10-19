import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';

const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {}
  return fallback;
};

// Full config from provisioned firebase-applet-config.json with env overrides
export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', configJson.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', configJson.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', configJson.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', configJson.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', configJson.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', configJson.appId),
  firestoreDatabaseId: getEnv('VITE_FIREBASE_DATABASE_ID', configJson.firestoreDatabaseId || 'ai-studio-kabiranews-7d7b1222-a3c8-46b5-b4a5-fea61b7ac7ed'),
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore targeting the specific provisioned database
const isBrowser = typeof window !== 'undefined';
let dbInstance: Firestore;

try {
  if (isBrowser) {
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    }, firebaseConfig.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
} catch {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Diagnostic connection test to verify Firestore availability
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'articles', 'health_check_ping'));
    return true;
  } catch (error: any) {
    // If permission or not found on document, connection still reached Firestore successfully
    if (error?.code === 'permission-denied' || error?.code === 'not-found') {
      return true;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
    return false;
  }
}

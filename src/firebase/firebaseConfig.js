import { initializeApp, getApps, getApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
};

// Staff auth (career/admin/superadmin) moved to a Postgres phone+PIN system
// (api/supabase/adminAuth.ts) — this module used to also export `auth` and
// `getSecondaryAuth` for Firebase Auth, both now unused. Realtime Database,
// Crashlytics, Messaging, etc. still sit on top of the default app below.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

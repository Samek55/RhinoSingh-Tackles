import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    databaseURL:process.env.EXPO_PUBLIC_DATABASE_URL,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Explicit type fix
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Secondary, unpersisted app instance used only when an already-signed-in admin
// creates *another* account. createUserWithEmailAndPassword() on the primary
// `auth` above would sign the caller in as the brand-new account, silently
// ending their own session — this isolated instance takes that side effect
// away from the caller's session entirely.
let secondaryAuth = null;
export function getSecondaryAuth() {
  if (!secondaryAuth) {
    const secondaryApp = getApps().some((a) => a.name === "Secondary")
      ? getApp("Secondary")
      : initializeApp(firebaseConfig, "Secondary");
    secondaryAuth = initializeAuth(secondaryApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return secondaryAuth;
}
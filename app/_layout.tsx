import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash visible until we explicitly hide it after init.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

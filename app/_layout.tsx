import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  useEffect(() => {
    try {
      // Dynamic require so a missing native module doesn't crash the whole layout
      const { LogLevel, OneSignal } = require('react-native-onesignal');
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize(`${process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID}`);
      OneSignal.Notifications.requestPermission(true);
      // Default all app users to 'user' role; admins override this tag on login
      OneSignal.User.addTag('role', 'user');
      OneSignal.Notifications.addEventListener('click', (event: any) => {
        console.log('Notification clicked:', event.notification.body);
      });
    } catch (e) {
      console.warn('OneSignal not available in this environment:', e);
    }
  }, []);
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

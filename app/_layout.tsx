import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { LogLevel, OneSignal, NotificationClickEvent } from 'react-native-onesignal';

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(`${process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID}`);
    OneSignal.Notifications.requestPermission(true);

    // 2. Explicitly type the event parameter here
    OneSignal.Notifications.addEventListener('click', (event: NotificationClickEvent) => {
      console.log('Notification clicked:', event.notification.body);
    });
  }, []);
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

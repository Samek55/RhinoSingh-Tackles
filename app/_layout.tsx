import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => { });

/**
 * Reusable helper to call upon user login.
 * Strictly links the user's ID and push tags, avoiding SMS/Email channels.
 */
export function syncPushUser(userId: string, role: 'admin' | 'career' | 'user') {
  try {
    const { OneSignal } = require('react-native-onesignal');
    
    // Identifies the user in OneSignal and links their push token to this ID
    OneSignal.login(userId);
    
    // Updates the role tag for targeted push segments
    OneSignal.User.addTag('role', role);
    
    console.log(`[Push Channel] User ${userId} synchronized with role: ${role}`);
  } catch (e) {
    console.warn('OneSignal user sync skipped (Non-native environment)');
  }
}

export default function RootLayout() {
  useEffect(() => {
    let isMounted = true;

    try {
      // Dynamic require ensures safety inside Expo Go/Web environments
      const { LogLevel, OneSignal } = require('react-native-onesignal');

      // Set up verbose debugging (Good for development, remove in production)
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);

      if (process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID) {
        OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);
        
        // Request OS-level push notification permissions
        OneSignal.Notifications.requestPermission(true);

        // Fallback default push tag
        OneSignal.User.addTag('role', 'user');
      } else {
        console.error('OneSignal App ID missing from environment variables.');
      }

      // Handle push notification click events
      const handleNotificationClick = (event: any) => {
        if (isMounted) {
          console.log('Push notification clicked:', event.notification.body);
          // Handle deep routing here if needed
        }
      };

      OneSignal.Notifications.addEventListener('click', handleNotificationClick);

      // Clean up event listener when root layout unmounts
      return () => {
        isMounted = false;
        try {
          OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
        } catch (clearError) {
          // Fail silently if library is absent during unmount
        }
      };

    } catch (e) {
      console.warn('OneSignal Push Channel not available in this environment:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
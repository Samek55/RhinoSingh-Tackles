import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CountryProvider } from '../src/context/countryContext';
import { UserProvider } from '../src/context/userContext';

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
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  const segments = useSegments();
  const router = useRouter();

  // --- FEATURE 1: STAFF SESSION PRESENCE TRACKER ---
  // Not a live listener like Firebase's onAuthStateChanged — AsyncStorage has
  // no such API, so login/logout screens emit 'authChanged' (DeviceEventEmitter)
  // to trigger a re-check here instead of waiting for a remount.
  useEffect(() => {
    const checkSession = async () => {
      const token = await AsyncStorage.getItem('adminSessionToken');
      setUser(token ? { token } : null);
      setInitializing(false);

      // Hide Splashscreen once state evaluates on app boot
      SplashScreen.hideAsync().catch(() => { });
    };

    checkSession();
    const subscription = DeviceEventEmitter.addListener('authChanged', checkSession);
    return () => subscription.remove();
  }, []);

  // --- FEATURE 2: SECURITY BOUNCER FOR /admin/* ROUTES ---
  useEffect(() => {
    if (initializing) return;

    // Evaluates if the current directory route segment matches your protected folder path.
    // AdminLogin itself lives inside this same 'admin' folder, so it's excluded here —
    // otherwise a logged-out user visiting the login screen gets bounced straight back
    // out of it by this guard, in an infinite loop with Admin.tsx's own redirect.
    // NOTE: this only covers routes under app/(drawer)/admin/. AdminChangePassword,
    // AdminCreate, and SuperAdminCreate live directly under app/(drawer)/ and are NOT
    // covered here — they each call useRequireRole/useRequireSuperAdmin themselves instead.
    const inAdminGroup = segments[0] === 'admin' && segments[1] !== 'AdminLogin';

    if (!user && inAdminGroup) {
      // Drop session context found while browsing protected assets: Redirect out
      router.replace('/Admin');
    } else if (user && segments[0] === 'Admin') {
      // Active context found when viewing public forms: Forward into panel
      router.replace('/admin/BookingHistory');
    }
  }, [user, initializing, segments]);

  // --- FEATURE 3: ONESIGNAL HARDWARE PROVISIONING CHANNEL ---
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
        OneSignal.User.addTag('role', '');
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

  // Show a neutral loading spinner inside safe layout context during auth evaluation shifts
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CountryProvider>
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </UserProvider>
      </CountryProvider>
    </SafeAreaProvider>
  );
}
import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (seen === 'true') {
          router.replace('/Home' as any);
        } else {
          router.replace('/onboarding1' as any);
        }
      } catch {
        router.replace('/onboarding1' as any);
      }
    };
    checkOnboarding();
  }, []);

  return null;
}

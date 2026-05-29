import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding1');
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
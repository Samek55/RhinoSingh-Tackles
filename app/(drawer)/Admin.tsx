import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Admin() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/AdminLogin');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
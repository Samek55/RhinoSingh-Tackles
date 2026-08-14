import { useEffect } from 'react';
import { router } from 'expo-router';
import { useCountry } from '@/src/context/countryContext';

// Client-side gate for the professional marketplace (Lead Fee, professional
// login, etc.) — this entire feature set only makes sense for Nepal (Khalti,
// Zoho, and the professional accounts themselves are Nepal-specific), and
// there's no server-side country signal to gate on instead (see
// src/context/countryContext.tsx — country lives only in client AsyncStorage).
// Call this at the top of any screen under app/(drawer)/professional/.
export function useRequireNepal() {
  const { country } = useCountry();

  useEffect(() => {
    if (country !== 'nepal') {
      router.replace('/Home');
    }
  }, [country]);

  return country === 'nepal';
}

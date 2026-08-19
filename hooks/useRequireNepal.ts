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
  const { country, resolved } = useCountry();

  // `country` defaults to 'india' synchronously and only reflects the real
  // detected value once `resolved` is true (AsyncStorage/IP/timezone lookup
  // takes at least one tick, up to ~3s on a fresh install). Redirecting on
  // the placeholder default bounced every Nepal professional who deep-linked
  // straight into a gated screen (e.g. from a "new lead" push notification)
  // to /Home before their real country was ever known.
  useEffect(() => {
    if (resolved && country !== 'nepal') {
      router.replace('/Home');
    }
  }, [resolved, country]);

  return resolved && country === 'nepal';
}

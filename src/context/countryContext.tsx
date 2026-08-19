import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CountryCode, CountryInfo, COUNTRIES } from '../constants/countryData';

const STORAGE_KEY = 'selectedCountry';

interface CountryContextType {
  country: CountryCode;
  countryInfo: CountryInfo;
  setCountry: (country: CountryCode) => void;
  toggleCountry: () => void;
  // False until AsyncStorage/IP/timezone detection has actually run once —
  // `country` defaults to 'india' synchronously before that, so a consumer
  // gating on "is this Nepal" must wait for `resolved` rather than react to
  // the placeholder default. See useRequireNepal.ts.
  resolved: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

// No SIM-reading native module in this project (and adding one means another native
// rebuild). Nepal vs. India can't be told apart by device locale/region either, since
// both commonly report "en-IN" style locales. The device timezone is the one signal
// that reliably tells the two apart without any new native dependency.
function detectCountryFromTimezone(): CountryCode {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === 'Asia/Kathmandu') return 'nepal';
  } catch {
    // Intl unavailable — fall through to default
  }
  return 'india';
}

// IP geolocation reflects where the device is actually connecting from, so it isn't
// fooled by a phone whose timezone was never set to Asia/Kathmandu. It needs network
// access though, so a short timeout keeps a flaky connection from stalling startup.
async function detectCountryFromIP(): Promise<CountryCode | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.country_code === 'NP') return 'nepal';
    if (data.country_code === 'IN') return 'india';
    return null;
  } catch {
    return null;
  }
}

async function detectCountry(): Promise<CountryCode> {
  const viaIP = await detectCountryFromIP();
  if (viaIP) return viaIP;
  return detectCountryFromTimezone();
}

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<CountryCode>('india');
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(async (saved) => {
      if (saved === 'india' || saved === 'nepal') {
        setCountryState(saved);
      } else {
        setCountryState(await detectCountry());
      }
      setResolved(true);
    });
  }, []);

  const setCountry = (next: CountryCode) => {
    setCountryState(next);
    setResolved(true);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const toggleCountry = () => {
    setCountry(country === 'india' ? 'nepal' : 'india');
  };

  return (
    <CountryContext.Provider
      value={{ country, countryInfo: COUNTRIES[country], setCountry, toggleCountry, resolved }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

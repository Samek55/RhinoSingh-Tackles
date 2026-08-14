import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Client-side UX gate (same caveat as useRequireRole.ts) — the real
// enforcement for account creation/role changes is the admin-create /
// update-staff-role edge functions' own verifyAdminSession() check.
export function useRequireSuperAdmin() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const [token, role] = await Promise.all([
        AsyncStorage.getItem('adminSessionToken'),
        AsyncStorage.getItem('adminRole'),
      ]);

      if (cancelled) return;

      if (!token) {
        router.replace('/admin/AdminLogin');
        return;
      }

      if (role === 'superadmin') {
        setAuthorized(true);
      } else {
        router.replace('/admin/BookingHistory');
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return authorized;
}

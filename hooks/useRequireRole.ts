import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AdminRole = 'career' | 'admin' | 'superadmin';

const DEFAULT_LANDING = {
  career: '/admin/BookingHistory',
  admin: '/admin/HelpboxHistory',
  superadmin: '/admin/ProfessionalHistory',
} as const;

// Client-side gate: app/_layout.tsx only bounces fully logged-out users out of
// '/admin/*'. It doesn't check *which* role a signed-in user has, so without this,
// any authenticated account (including a self-service "career" signup) can reach
// every admin screen. Call this at the top of any screen that should be restricted
// to a subset of roles, and don't render real content until `authorized` is true.
//
// This is a presence/UX check against locally-stored session state (set at
// login by adminLogin() in api/supabase/adminAuth.ts), not a cryptographic
// verification — the real enforcement for any privileged action happens
// server-side, in each edge function's own verifyAdminSession() call. A
// session deleted server-side (PIN reset elsewhere, deactivation, natural
// expiry) won't be caught here until the first server call after it 401s.
export function useRequireRole(allowedRoles: AdminRole[]) {
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const [token, fetchedRole] = await Promise.all([
        AsyncStorage.getItem('adminSessionToken'),
        AsyncStorage.getItem('adminRole'),
      ]);

      if (cancelled) return;

      if (!token) {
        router.replace('/admin/AdminLogin');
        return;
      }

      if (fetchedRole && allowedRoles.includes(fetchedRole as AdminRole)) {
        setRole(fetchedRole as AdminRole);
        setAuthorized(true);
      } else {
        router.replace(fetchedRole && fetchedRole in DEFAULT_LANDING
          ? DEFAULT_LANDING[fetchedRole as AdminRole]
          : '/admin/AdminLogin');
      }
    };

    check();
    return () => {
      cancelled = true;
    };
    // allowedRoles is passed as a literal array at each call site, so it's safe to
    // depend only on its (stable-per-mount) identity rather than re-running per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { authorized, role };
}

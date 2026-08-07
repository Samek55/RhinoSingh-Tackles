import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '@/src/firebase/firebaseConfig';

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
export function useRequireRole(allowedRoles: AdminRole[]) {
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/admin/AdminLogin');
        return;
      }

      try {
        const db = getDatabase();
        const snapshot = await get(ref(db, `users/${user.uid}`));
        const fetchedRole: AdminRole | null = snapshot.exists() ? snapshot.val()?.role : null;

        if (cancelled) return;

        if (fetchedRole && allowedRoles.includes(fetchedRole)) {
          setRole(fetchedRole);
          setAuthorized(true);
        } else {
          router.replace(fetchedRole ? DEFAULT_LANDING[fetchedRole] : '/admin/AdminLogin');
        }
      } catch {
        if (!cancelled) router.replace('/admin/AdminLogin');
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

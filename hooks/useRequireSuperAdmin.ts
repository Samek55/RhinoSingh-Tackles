import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '@/src/firebase/firebaseConfig';

// Account-creation screens (AdminCreate, SuperAdminCreate) write directly to the
// 'admin'/'superadmin' role field with no server-side check, so the UI-level guard
// here is what actually stops an anonymous visitor from self-provisioning a
// privileged account. Only a superadmin is allowed past.
export function useRequireSuperAdmin() {
  const [authorized, setAuthorized] = useState(false);

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
        const role = snapshot.exists() ? snapshot.val()?.role : null;

        if (cancelled) return;

        if (role === 'superadmin') {
          setAuthorized(true);
        } else {
          router.replace('/admin/BookingHistory');
        }
      } catch {
        if (!cancelled) router.replace('/admin/AdminLogin');
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return authorized;
}

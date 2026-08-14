import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase';

export interface AdminLoginResult {
  success: boolean;
  status?: string;
  role?: 'career' | 'admin' | 'superadmin';
  displayName?: string;
  sessionToken?: string;
  message?: string;
  remainingAttempts?: number;
}

export const adminLogin = async (phone: string, pin: string): Promise<AdminLoginResult> => {
  const { data, error } = await supabase.functions.invoke('admin-login', {
    body: { phone, pin },
  });

  if (error) {
    try {
      const body = await error.context?.json();
      return body ?? { success: false, message: error.message };
    } catch {
      return { success: false, message: error.message };
    }
  }

  if (data?.success && data?.sessionToken) {
    await AsyncStorage.multiSet([
      ['adminPhone', phone],
      ['adminRole', data.role ?? ''],
      ['adminSessionToken', data.sessionToken],
      ['userProfileSetupCompleted', 'true'],
    ]);
  }

  return data;
};

export const getAdminSession = async (): Promise<{ token: string; phone: string; role: string } | null> => {
  const [token, phone, role] = await AsyncStorage.multiGet(['adminSessionToken', 'adminPhone', 'adminRole']);
  if (!token[1] || !phone[1]) return null;
  return { token: token[1], phone: phone[1], role: role[1] ?? '' };
};

export const logoutAdmin = async (): Promise<void> => {
  const token = await AsyncStorage.getItem('adminSessionToken');
  if (token) {
    supabase.functions
      .invoke('logout', { headers: { 'x-admin-session-token': token } })
      .catch(() => {});
  }
  await AsyncStorage.multiRemove(['adminPhone', 'adminRole', 'adminSessionToken', 'userProfileSetupCompleted']);
};

export const requestAdminPinReset = async (phone: string): Promise<{ ok: boolean }> => {
  const { data, error } = await supabase.functions.invoke('send-otp', {
    body: { to: phone, purpose: 'pin-reset' },
  });
  if (error) return { ok: false };
  return { ok: Boolean(data?.ok) };
};

export const confirmAdminPinReset = async (
  phone: string,
  otpCode: string,
  newPin: string
): Promise<{ success: boolean; message?: string }> => {
  const { data, error } = await supabase.functions.invoke('admin-set-pin', {
    body: { mode: 'reset', phone, otpCode, newPin },
  });
  if (error) return { success: false, message: error.message };
  return data;
};

export const changeAdminPin = async (
  phone: string,
  oldPin: string,
  newPin: string
): Promise<{ success: boolean; message?: string }> => {
  const { data, error } = await supabase.functions.invoke('admin-set-pin', {
    body: { mode: 'change', phone, oldPin, newPin },
  });
  if (error) return { success: false, message: error.message };
  return data;
};

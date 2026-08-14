import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase';

const SESSION_TOKEN_KEY = 'professionalSessionToken';
const SESSION_PHONE_KEY = 'professionalSessionPhone';

export interface ProfessionalLoginResult {
  success: boolean;
  token?: string;
  fullName?: string;
  error?: string;
  remainingAttempts?: number;
}

export const professionalLogin = async (phone: string, pin: string): Promise<ProfessionalLoginResult> => {
  const { data, error } = await supabase.functions.invoke('professional-login', {
    body: { phone, pin },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.success && data?.token) {
    await AsyncStorage.setItem(SESSION_TOKEN_KEY, data.token);
    await AsyncStorage.setItem(SESSION_PHONE_KEY, phone);
  }

  return data;
};

export const getProfessionalSession = async (): Promise<{ token: string; phone: string } | null> => {
  const [token, phone] = await Promise.all([
    AsyncStorage.getItem(SESSION_TOKEN_KEY),
    AsyncStorage.getItem(SESSION_PHONE_KEY),
  ]);
  if (!token || !phone) return null;
  return { token, phone };
};

export const logoutProfessional = async (): Promise<void> => {
  await AsyncStorage.multiRemove([SESSION_TOKEN_KEY, SESSION_PHONE_KEY]);
};

export const requestPinReset = async (phone: string): Promise<{ ok: boolean }> => {
  const { data, error } = await supabase.functions.invoke('send-otp', {
    body: { to: phone, purpose: 'pin-reset' },
  });
  if (error) return { ok: false };
  return { ok: Boolean(data?.ok) };
};

export const confirmPinReset = async (
  phone: string,
  otpCode: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.functions.invoke('set-pin', {
    body: { mode: 'reset', phone, otpCode, newPin },
  });
  if (error) return { success: false, error: error.message };
  return data;
};

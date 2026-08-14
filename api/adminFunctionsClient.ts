import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase';

const TIMEOUT_MS = 15000;

// Shared caller for staff-gated edge functions — attaches the
// x-admin-session-token header when requireSession is true, recovers the
// structured JSON body Supabase's client would otherwise swallow on a
// non-2xx (FunctionsHttpError only exposes the raw Response via
// error.context by default), and times out rather than hanging forever on a
// stalled network.
export async function invokeEdgeFunction<T = any>(
  name: string,
  body: object,
  fallbackMessage: string,
  options?: { requireSession?: boolean }
): Promise<T> {
  let headers: Record<string, string> | undefined;
  if (options?.requireSession) {
    const token = await AsyncStorage.getItem('adminSessionToken');
    if (token) headers = { 'x-admin-session-token': token };
  }

  const invokePromise = supabase.functions.invoke(name, { body, headers });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${name} timed out`)), TIMEOUT_MS)
  );

  try {
    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
    if (error) {
      try {
        const recovered = await error.context?.json();
        return (recovered ?? { success: false, message: error.message }) as T;
      } catch {
        return { success: false, message: error.message } as T;
      }
    }
    return data as T;
  } catch (e: any) {
    return { success: false, message: e?.message || fallbackMessage } as T;
  }
}

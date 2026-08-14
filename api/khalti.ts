import { supabase } from '@/src/lib/supabase';
import { getProfessionalSession } from '@/api/supabase/professionalAuth';

interface InvokeResult<T> {
  data: T | null;
  error: string | null;
}

// supabase-js throws away the response body on a non-2xx from an edge
// function (surfaces only a generic FunctionsHttpError) — these functions
// return meaningful JSON on 4xx/5xx too (e.g. { error: 'Your account is not
// active' }), so read the body back out of the error when present.
async function readFunctionResult<T>(invoke: Promise<{ data: any; error: any }>): Promise<InvokeResult<T>> {
  const { data, error } = await invoke;
  if (!error) return { data, error: null };

  try {
    const body = await error.context?.json();
    return { data: null, error: body?.error || error.message };
  } catch {
    return { data: null, error: error.message };
  }
}

export async function initiateLeadPayment(bookingId: string) {
  const session = await getProfessionalSession();
  if (!session) return { data: null, error: 'Please log in again' };

  return readFunctionResult<{ pidx: string; payment_url: string }>(
    supabase.functions.invoke('khalti-initiate-lead-payment', {
      body: { bookingId, token: session.token },
    })
  );
}

export async function confirmLeadUnlock(bookingId: number, pidx: string) {
  const session = await getProfessionalSession();
  if (!session) return { data: null, error: 'Please log in again' };

  return readFunctionResult<{ success: boolean; status?: string; error?: string }>(
    supabase.functions.invoke('khalti-confirm-lead-unlock', {
      body: { bookingId, pidx, token: session.token },
    })
  );
}

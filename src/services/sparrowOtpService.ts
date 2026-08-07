const SPARROW_SMS_URL = 'https://api.sparrowsms.com/v2/sms/';

type OtpFlow = 'booking' | 'helpbox';

interface PendingOtp {
  otp: string;
  phone: string;
  expiresAt: number;
}

export const OTP_TTL_MS = 5 * 60 * 1000; // codes are valid for 5 minutes
export const RESEND_COOLDOWN_SECONDS = 30;

const pendingOtps: Record<OtpFlow, PendingOtp | null> = {
  booking: null,
  helpbox: null,
};

// Tracks when a code was last (re)sent per flow so the UI can enforce a resend
// cooldown — without this, "Resend Code" could be tapped as fast as the user
// likes, sending unlimited real SMS through Sparrow.
const lastSentAt: Record<OtpFlow, number> = {
  booking: 0,
  helpbox: 0,
};

// Kept separately from pendingOtps so "Resend Code" still knows which number to
// message after the pending code has expired (getPendingOtp clears on expiry).
const lastPhone: Record<OtpFlow, string | null> = {
  booking: null,
  helpbox: null,
};

function buildOtpMessage(flow: OtpFlow, otp: string, greetingName?: string): string {
  if (flow === 'booking') {
    const firstName = greetingName ? String(greetingName).split(' ')[0] : 'Customer';
    return `Dear ${firstName}, Your Service Booking OTP code is ${otp}.\n\nThank You for using RocketSingh\n( https://RocketSingh.app )`;
  }
  return `Hi, Thank you for submitting help request. Your OTP code is ${otp}.\n\nThank You for using RocketSingh\n( https://RocketSingh.app )`;
}

export const sparrowOtpService = {
  // 4 digits, matching the HomeSewa Sparrow OTP UI convention
  generateOtp: (): string => String(Math.floor(1000 + Math.random() * 9000)),

  // fullPhone must be digits only with country code, e.g. 9779843624971 (no '+')
  sendOtp: async (fullPhone: string, otp: string, flow: OtpFlow, greetingName?: string): Promise<boolean> => {
    const token = process.env.EXPO_PUBLIC_SPARROW_TOKEN;
    const from = process.env.EXPO_PUBLIC_SPARROW_FROM;

    const body = new URLSearchParams({
      token: token || '',
      from: from || '',
      to: fullPhone,
      text: buildOtpMessage(flow, otp, greetingName),
    });

    const response = await fetch(SPARROW_SMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const responseBody = await response.text();
    console.log('[Sparrow] to:', fullPhone, 'response status:', response.status, 'body:', responseBody);

    return response.ok;
  },

  setPendingOtp: (flow: OtpFlow, pending: { otp: string; phone: string }) => {
    pendingOtps[flow] = { ...pending, expiresAt: Date.now() + OTP_TTL_MS };
    lastSentAt[flow] = Date.now();
    lastPhone[flow] = pending.phone;
  },

  // Survives OTP expiry, unlike getPendingOtp — lets "Resend Code" still target
  // the right number after the original code has timed out.
  getLastPhone: (flow: OtpFlow): string | null => lastPhone[flow],

  // Returns null (and clears the stale entry) once the code has expired, so a
  // code from a previous session can no longer verify successfully.
  getPendingOtp: (flow: OtpFlow): PendingOtp | null => {
    const pending = pendingOtps[flow];
    if (!pending) return null;

    if (Date.now() > pending.expiresAt) {
      pendingOtps[flow] = null;
      return null;
    }

    return pending;
  },

  clearPendingOtp: (flow: OtpFlow) => {
    pendingOtps[flow] = null;
  },

  // Seconds remaining before "Resend Code" may be used again for this flow (0 = ready).
  getResendCooldownSeconds: (flow: OtpFlow): number => {
    const elapsedMs = Date.now() - lastSentAt[flow];
    const remainingMs = RESEND_COOLDOWN_SECONDS * 1000 - elapsedMs;
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  },
};

const SPARROW_SMS_URL = 'https://api.sparrowsms.com/v2/sms/';

type OtpFlow = 'booking' | 'helpbox';

interface PendingOtp {
  otp: string;
  phone: string;
}

const pendingOtps: Record<OtpFlow, PendingOtp | null> = {
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

  setPendingOtp: (flow: OtpFlow, pending: PendingOtp) => {
    pendingOtps[flow] = pending;
  },

  getPendingOtp: (flow: OtpFlow): PendingOtp | null => pendingOtps[flow],

  clearPendingOtp: (flow: OtpFlow) => {
    pendingOtps[flow] = null;
  },
};

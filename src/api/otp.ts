const ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
const SERVICE_SID = process.env.EXPO_PUBLIC_TWILIO_VERIFY_SERVICE_SID;

export interface SendOtpResponse {
  success: boolean;
  status: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  status: 'approved' | 'pending' | string;
}

// SEND OTP — calls Twilio Verify API directly
export const sendOtp = async (phone: string): Promise<SendOtpResponse | null> => {
  try {
    const credentials = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);

    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${SERVICE_SID}/Verifications`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `To=${encodeURIComponent(phone)}&Channel=sms`,
      }
    );

    const data = await res.json();
    console.log('Send OTP response:', data);

    return {
      success: data.status === 'pending',
      status: data.status ?? 'error',
    };
  } catch (error) {
    console.log('Send OTP error:', error);
    return null;
  }
};

// VERIFY OTP — calls Twilio Verify API directly
export const verifyOtp = async (
  phone: string,
  code: string
): Promise<VerifyOtpResponse | null> => {
  try {
    const credentials = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);

    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${SERVICE_SID}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `To=${encodeURIComponent(phone)}&Code=${encodeURIComponent(code)}`,
      }
    );

    const data = await res.json();
    console.log('Verify OTP response:', data);

    return {
      success: data.status === 'approved',
      status: data.status ?? 'pending',
    };
  } catch (error) {
    console.log('Verify OTP error:', error);
    return null;
  }
};

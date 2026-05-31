const BASE_URL = process.env.EXPO_PUBLIC_TWILIO_BASE_URL;

export interface SendOtpResponse {
  success: boolean;
  status: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  status: 'approved' | 'pending' | string;
}

export const sendOtp = async (phone: string): Promise<SendOtpResponse | null> => {
  try {
    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `To=${encodeURIComponent(phone)}`,
    });

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

export const verifyOtp = async (
  phone: string,
  code: string
): Promise<VerifyOtpResponse | null> => {
  try {
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `To=${encodeURIComponent(phone)}&Code=${encodeURIComponent(code)}`,
    });

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

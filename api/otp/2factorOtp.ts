import axios from 'axios';

const TWOFACTOR_API_KEY = process.env.EXPO_PUBLIC_2FACTOR_API_KEY; 

if (!TWOFACTOR_API_KEY) {
  console.warn("Warning: EXPO_PUBLIC_2FACTOR_API_KEY is not defined in your environment!");
}

const BASE_URL = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS`;

interface OtpResponse {
  Status: 'Success' | 'Error';
  Details: string;
}

/**
 * Sends a system-generated OTP to a specified phone number via 2Factor.
 */
export const sendOtp = async (
  phoneNumber: string, 
  templateName: string = 'AUTOGEN3'
): Promise<OtpResponse> => {
  try {
    const encodedTemplate = encodeURIComponent(templateName);
    const url = `${BASE_URL}/${phoneNumber}/AUTOGEN/${encodedTemplate}`;

    const response = await axios.get<OtpResponse>(url);
    return response.data; // On Success, response.data.Details contains the Session ID string
  } catch (error: any) {
    console.error('Failed to send OTP:', error?.response?.data || error.message);
    return {
      Status: 'Error',
      Details: error?.response?.data?.Details || 'Network or configuration error',
    };
  }
};

/**
 * Verifies the user-entered OTP against the session ID provided during sendOtp.
 */
export const verifyOtp = async (
  sessionId: string,
  otpCode: string
): Promise<OtpResponse> => {
  try {
    // 2Factor Verification Endpoint Hierarchy: SMS/VERIFY/{session_id}/{otp_input}
    const url = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otpCode}`;
    
    const response = await axios.get<OtpResponse>(url);
    return response.data; // Will return status "Success" and Details "OTP Matched" if correct
  } catch (error: any) {
    console.error('Failed to verify OTP:', error?.response?.data || error.message);
    return {
      Status: 'Error',
      Details: error?.response?.data?.Details || 'OTP mismatch or expired session',
    };
  }
};
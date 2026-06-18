import axios from 'axios';

const TWOFACTOR_API_KEY = process.env.EXPO_PUBLIC_2FACTOR_API_KEY; 

if (!TWOFACTOR_API_KEY) {
  console.warn("Warning: EXPO_PUBLIC_2FACTOR_API_KEY is not defined in your environment!");
}

// Note: WhatsApp utility actions use the ADDON_SERVICES endpoint base
const BASE_URL = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/ADDON_SERVICES/WHATSAPP`;

interface WhatsappOtpResponse {
  Status: 'Success' | 'Error';
  Details: string; // Contains the Session ID string on success
}

/**
 * Sends an automatically generated OTP to a specified phone number via WhatsApp.
 * Make sure your WhatsApp template is pre-approved in the 2Factor dashboard.
 */
export const sendWhatsAppOtp = async (
  phoneNumber: string, 
  templateName: string
): Promise<WhatsappOtpResponse> => {
  try {
    // WhatsApp OTP requires a POST request containing structural parameters
    const response = await axios.post<WhatsappOtpResponse>(BASE_URL, {
      To: phoneNumber,
      TemplateName: templateName,
      // Optional: You can pass custom field mappings if your template expects them
      // From: "YOUR_APPROVED_SENDER_NUMBER" 
    });

    return response.data; 
  } catch (error: any) {
    console.error('Failed to send WhatsApp OTP:', error?.response?.data || error.message);
    return {
      Status: 'Error',
      Details: error?.response?.data?.Details || 'WhatsApp delivery or configuration error',
    };
  }
};

/**
 * Verifies the user-entered WhatsApp OTP against the session ID.
 * The verification mechanism works identically to the standard SMS validation.
 */
export const verifyWhatsAppOtp = async (
  sessionId: string,
  otpCode: string
): Promise<WhatsappOtpResponse> => {
  try {
    // 2Factor utilizes the same validation pipeline for checking OTP legitimacy
    const url = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otpCode}`;
    
    const response = await axios.get<WhatsappOtpResponse>(url);
    return response.data; 
  } catch (error: any) {
    console.error('Failed to verify WhatsApp OTP:', error?.response?.data || error.message);
    return {
      Status: 'Error',
      Details: error?.response?.data?.Details || 'OTP mismatch or expired session',
    };
  }
};
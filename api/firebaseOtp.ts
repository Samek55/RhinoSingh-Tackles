import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * Sends a Firebase OTP to the specified phone number.
 * Ensure phone number is in E.164 format (e.g., +16505551234)
 */
export const sendFirebaseOtp = async (phone: string): Promise<FirebaseAuthTypes.ConfirmationResult> => {
  try {
    // Basic formatting clean-up fallback
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;
    return await auth().signInWithPhoneNumber(formattedPhone);
  } catch (error: any) {
    console.error('Firebase OTP Send Handshake Error:', error.code, error.message);
    throw error; // Re-throw so your UI layout can display the error to the user
  }
};

/**
 * Verifies the incoming OTP code against the active session confirmation block.
 */
export const verifyFirebaseOtp = async (
  confirmation: FirebaseAuthTypes.ConfirmationResult | null, 
  code: string
): Promise<boolean> => {
  try {
    // 1. Check if the orchestration object exists and retains its native method prototype
    if (!confirmation || typeof confirmation.confirm !== 'function') {
      console.error('Verification Error: The confirmation object is missing or has lost its native instance prototype.');
      return false;
    }

    // 2. Clear input whitespace strings
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      console.warn('Verification Warning: Input token length does not match standard 6 digits.');
      return false;
    }

    await confirmation.confirm(cleanCode);
    return true;
  } catch (error: any) {
    // Captures errors like 'auth/invalid-verification-code' or 'auth/session-expired'
    console.log('Firebase OTP verify layer error:', error.code, error.message);
    return false;
  }
};
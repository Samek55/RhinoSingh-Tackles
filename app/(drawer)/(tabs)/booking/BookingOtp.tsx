import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router, useLocalSearchParams } from 'expo-router';
import Header2 from '@/components/Header2';

// API & CONFIG IMPORTS
import { notifyProfessionals } from '../../../../api/notifications';
import { OneSignal } from 'react-native-onesignal';
import { createBookingSupabase } from '@/api/supabase/createBookingSupabase';

// IMPORT THE GLOBAL FIREBASE AUTH CONFIRMATION INSTANCE
import { globalBookingFirebaseConfirmation } from './BookingDetail';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => {
  const guidelineBaseWidth = 375;
  return (size * width) / guidelineBaseWidth;
};

export default function BookingOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    name,
    number,
    selectedService,
    selectedShift,
    selectedArea,
    selectedPriority,
    selectedBudget,
    message,
    date,
    role,
  } = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      setOtp(['', '', '', '', '', '']);
    }, []),
  );

  const handleChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanedText.slice(-1);
    setOtp(newOtp);

    if (cleanedText && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (text === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatDate = (date: any) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const handleResendCode = async () => {
    if (!number) return;
    Alert.alert('Resend', 'Resend functionality needs to be linked to your custom SMS gateway.');
  };

  const handleNavigate = async () => {
    const enteredOtp = otp.join('');

    if (isSubmitting) return;

    if (enteredOtp.length < 6) {
      Alert.alert('Validation Error', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check if the orchestration object exists
      if (!globalBookingFirebaseConfirmation) {
        Alert.alert("Verification Error", "No active SMS session found. Please go back and try again.");
        setIsSubmitting(false);
        return;
      }

      console.log("Verifying code with Firebase...");

      // 2. Invoke verification explicitly on the instance object returned by signInWithPhoneNumber
      await globalBookingFirebaseConfirmation.confirm(enteredOtp);

      console.log("SMS OTP Verified successfully!");

      // 3. Complete your OneSignal push registration safely below...
      if (number) {
        try {
          const cleanNumber = String(number).replace(/[^\d]/g, '');
          OneSignal.login(cleanNumber);

          setTimeout(() => {
            const assignedRole = role ? String(role) : 'user';
            OneSignal.User.addTags({
              role: assignedRole,
              phone: cleanNumber,
            });
            console.log(`OneSignal tags pushed successfully: role=${assignedRole}`);
          }, 800);
        } catch (e) {
          console.log("OneSignal integration tracking warning", e);
        }
      }


      const booking = {
        full_name: name,
        phone: number,
        area: [selectedArea],
        select_services: [selectedService], // Wrap this too if services is an array column
        priority: selectedPriority,
        select_shift: selectedShift,
        work_description: message,
        budget: selectedBudget,
        service_booking_datetime: formatDate(date),
        status: "New / Open"
      };

      // 5. Safe insertion via public/secret-key insert policy
      await createBookingSupabase(booking);

      // 6. Alert downstream providers
      // try {
      //   const targetService = Array.isArray(selectedService) ? selectedService[0] : selectedService;
      //   const targetArea = Array.isArray(selectedArea) ? selectedArea[0] : selectedArea;
      //   console.log(`Sending notification matching service: ${targetService} and area: ${targetArea}`);

      //   await notifyProfessionals(
      //     String(targetService).trim(),
      //     String(targetArea).trim()
      //   );
      // } catch (e) {
      //   console.log("Notification background delivery failed contextually", e);
      // }

      setOtp(['', '', '', '', '', '']);
      router.push('/booking/BookingVerify');

    } catch (error: any) {
      console.log("BOOKING CODE VERIFICATION FAULT:", error);
      Alert.alert(
        'Submission Failed',
        error.message || 'Invalid verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1 }} >
      <Header2 />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
        <View style={styles.container}>
          <Text style={styles.thankYouText}>
            Phone Verification
          </Text>

          <Text style={styles.bookingText}>
            Booking request received. Awaiting confirmation!
          </Text>

          <Text style={styles.otpPromptText}>Enter your verification code below.</Text>

          <View style={styles.otpBox}>
            {otp.map((_, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.input}
                keyboardType="numeric"
                maxLength={1}
                value={otp[index]}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={event => handleKeyPress(event, index)}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendcode}>
              {`Didn't get code?`} <Text style={{ color: 'blue', fontWeight: 'bold' }}>Resend Code</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
            onPress={handleNavigate}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Verifying...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: '5%', paddingTop: height * 0.09, alignItems: 'center', backgroundColor: '#fff' },
  thankYouText: { fontSize: scaleFont(27), fontWeight: '700' },
  bookingText: { width: '70%', textAlign: 'center', marginBottom: height * 0.08, fontSize: scaleFont(17), marginTop: height * 0.03, fontWeight: '500', lineHeight: 23 },
  otpPromptText: { fontSize: scaleFont(16.5), marginBottom: height * 0.04, fontWeight: '400', color: 'green' },
  otpBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3 },
  input: { width: width * 0.12, height: width * 0.12, marginHorizontal: 5, borderWidth: 1, borderColor: 'hsl(0, 0%, 79%)', borderRadius: 5, textAlign: 'center', fontSize: scaleFont(18), backgroundColor: '#fff', elevation: 3 },
  resendcode: { marginTop: 25, paddingHorizontal: 20, textAlign: 'center', lineHeight: 22, fontSize: hp('1.5%') },
  submitButton: { backgroundColor: 'green', height: height * 0.06, width: '80%', justifyContent: 'center', alignItems: 'center', borderRadius: 100, marginTop: height * 0.08 },
  submitButtonText: { fontSize: scaleFont(19), color: '#fff', fontWeight: '300' },
});
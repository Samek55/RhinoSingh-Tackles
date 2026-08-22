import React, { useEffect, useRef, useState } from 'react';
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
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router, useLocalSearchParams } from 'expo-router';
import Header2 from '@/components/Header2';

// API & CONFIG IMPORTS
import { notifyProfessionals } from '../../../../api/notifications';
import { createBookingSupabase } from '@/api/supabase/createBookingSupabase';
import { sparrowOtpService } from '@/src/services/sparrowOtpService';
import { toLocalDateString } from '@/src/utils/dateFormat';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => {
  const guidelineBaseWidth = 375;
  return (size * width) / guidelineBaseWidth;
};

export default function BookingOtp() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(() => sparrowOtpService.getResendCooldownSeconds('booking'));

  const {
    name,
    number,
    selectedService,
    selectedShift,
    selectedLocation,
    selectedArea,
    selectedPriority,
    selectedBudget,
    message,
    date,
    role,
    fileUrls,
  } = useLocalSearchParams();

  const uploadedFiles = fileUrls ? JSON.parse(fileUrls as string) : [];

  useFocusEffect(
    React.useCallback(() => {
      setOtp(['', '', '', '']);
    }, []),
  );

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(sparrowOtpService.getResendCooldownSeconds('booking'));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && index > 0) {
      // Check both current state and raw input value to prevent double focus jumping triggers on Android
      if (!otp[index]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Uses the local calendar day rather than UTC (India/Nepal are both
  // UTC+5:30/+5:45, so converting to UTC first can roll the date back a day).
  const formatDate = (dateValue: any) => {
    if (!dateValue) return toLocalDateString(new Date());
    const parsedDate = new Date(dateValue);
    // Fallback safe layer if string passing is corrupt or bad formatted
    return isNaN(parsedDate.getTime())
      ? toLocalDateString(new Date())
      : toLocalDateString(parsedDate);
  };

  const handleResendCode = async () => {
    const cooldown = sparrowOtpService.getResendCooldownSeconds('booking');
    if (cooldown > 0) {
      Alert.alert('Please Wait', `You can request a new code in ${cooldown}s.`);
      setResendCooldown(cooldown);
      return;
    }

    const phone = sparrowOtpService.getLastPhone('booking');
    if (!phone) return;

    try {
      const newOtp = sparrowOtpService.generateOtp();
      const sent = await sparrowOtpService.sendOtp(phone, newOtp, 'booking', name ? String(name) : undefined);

      if (!sent) {
        Alert.alert('Resend Failed', 'Could not send a new verification code. Please try again.');
        return;
      }

      sparrowOtpService.setPendingOtp('booking', { otp: newOtp, phone });
      setResendCooldown(sparrowOtpService.getResendCooldownSeconds('booking'));
      Alert.alert('Success', 'A new code has been successfully sent.');
    } catch (error: any) {
      Alert.alert('Resend Failed', error.message || 'Unable to re-send verification code.');
    }
  };

  const handleNavigate = async () => {
    const enteredOtp = otp.join('');

    if (isSubmitting) return;

    if (enteredOtp.length < 4) {
      Alert.alert('Validation Error', 'Please enter the complete 4-digit verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const pending = sparrowOtpService.getPendingOtp('booking');

      if (!pending) {
        Alert.alert('Verification Error', 'No active verification session found. Please go back and try again.');
        setIsSubmitting(false);
        return;
      }

      if (enteredOtp !== pending.otp) {
        const { remainingAttempts, lockedOut } = sparrowOtpService.registerFailedAttempt('booking');
        if (lockedOut) {
          Alert.alert('Too Many Attempts', 'You have entered the wrong code too many times. Please request a new code.');
        } else {
          Alert.alert('Verification Failed', `The code entered is invalid. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
        }
        setIsSubmitting(false);
        return;
      }

      // Complete your OneSignal push registration safely below...
      if (number) {
        try {
          const { OneSignal } = require('react-native-onesignal');
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
        full_name: name ? String(name) : '',
        phone: number ? String(number) : '',
        city: selectedLocation ? String(selectedLocation) : '',
        area: selectedArea ? [String(selectedArea)] : [],
        select_services: selectedService ? [String(selectedService)] : [], // Wrap this too if services is an array column
        priority: selectedPriority ? String(selectedPriority) : 'Normal',
        select_shift: selectedShift ? String(selectedShift) : '',
        work_description: message ? String(message) : '',
        budget: selectedBudget ? String(selectedBudget) : '',
        service_booking_datetime: formatDate(date),
        status: "New / Open",
        add_photos_picture: uploadedFiles,
      };

      // Safe insertion via public/secret-key insert policy
      await createBookingSupabase(booking);

      sparrowOtpService.clearPendingOtp('booking');

      // Alert downstream providers
      try {
        const targetService = Array.isArray(selectedService) ? selectedService[0] : selectedService;
        const targetArea = Array.isArray(selectedArea) ? selectedArea[0] : selectedArea;
        console.log(`Sending notification matching service: ${targetService} and area: ${targetArea}`);

        if (targetService && targetArea) {
          await notifyProfessionals(
            String(targetService).trim(),
            String(targetArea).trim()
          );
        }
      } catch (e) {
        console.log("Notification background delivery failed contextually", e);
      }

      setOtp(['', '', '', '']);
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

          <TouchableOpacity onPress={handleResendCode} disabled={resendCooldown > 0}>
            <Text style={styles.resendcode}>
              {`Didn't get code?`}{' '}
              <Text style={{ color: resendCooldown > 0 ? 'gray' : 'blue', fontWeight: 'bold' }}>
                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
              </Text>
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

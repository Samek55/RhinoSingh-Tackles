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
import React, { useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { createBooking } from '../../../../api/PostApiBooking';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import base from '../../../../api/airtable';
import { verifyOtp } from '../../../../api/otp';
import { router, useLocalSearchParams } from 'expo-router';
import Header2 from '@/components/Header2';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

// Font scaling utility function
const scaleFont = (size: number) => {
  const guidelineBaseWidth = 375; // Base screen width to scale from
  return (size * width) / guidelineBaseWidth;
};

export default function BookingOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Manage OTP state
  const inputRefs = useRef<Array<TextInput | null>>([]);
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
  } = useLocalSearchParams();

  // Clear OTP whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setOtp(['', '', '', '', '', '']); // Reset OTP on screen focus
    }, []),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Automatically focus next input box if the user types a number
    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    // Handle backspace to move focus to the previous box
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const formatDate = (date: any) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const handleNavigate = async () => {
    const enteredOtp = otp.join('');

    // prevent multiple calls
    if (isSubmitting) return;

    // Ensure they filled out all 5 boxes
    if (enteredOtp.length < 6) {
      Alert.alert('Validation Error', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const formattedNumber = `+977` + number;
    try {

      console.log(`Verifying phone: ${formattedNumber} with code: ${enteredOtp}`);
      const verificationResult = await verifyOtp(formattedNumber, enteredOtp);

      // 2. Evaluate the live Twilio approval status response
      if (!verificationResult || !verificationResult.success || verificationResult.status !== 'approved') {
        Alert.alert('Verification Failed', 'The code entered is invalid or has expired.');
        setIsSubmitting(false);
        return;
      }

      const serviceRecords = await base("Services")
        .select()
        .all();

      const serviceMap = serviceRecords.map((rec: any) => ({
        id: rec.id,
        name: rec.fields.Name,
      }));

      const serviceIds = Array.isArray(selectedService)
        ? selectedService
          .map((name: string) =>
            serviceMap.find((s: any) => s.name === name)?.id
          )
          .filter(Boolean)
        : [
          serviceMap.find((s: any) => s.name === selectedService)?.id,
        ].filter(Boolean);

      if (serviceIds.length === 0) {
        Alert.alert("Error", "No valid service selected");
        return;
      }

      const booking = {
        "Full name": name,
        "Phone": number,
        "Select Services": serviceIds,
        "Area": selectedArea,
        "Priority": selectedPriority,
        "Select Shift": selectedShift,
        "Work Description": message,
        "Budget": selectedBudget,
        "Starting Date": formatDate(date),
      };

      await createBooking(booking);


      router.push('/booking/BookingVerify')

    } catch (error) {
      console.log("BOOKING ERROR:", error);
      Alert.alert('Error', 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
      <View style={{ flex: 1 }} >
        <Header2 />
        <View style={styles.container}>
          <Text style={styles.thankYouText}>
            Phone Verification
          </Text>

          <Text style={styles.bookingText}>
            Booking request received. Awaiting confirmation!
          </Text>

          <Text style={styles.otpPromptText}>Enter your OTP to continue.</Text>

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

          <Text style={styles.resendcode}>{`Didn't get code?`} <Text style={{ color: 'blue' }}>Resend Code</Text></Text>

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
      </View >
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: height * 0.09, // Adjust top padding based on screen size
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  thankYouText: {
    fontSize: scaleFont(27),
    fontWeight: '700',
  },
  bookingText: {
    width: '70%',
    textAlign: 'center',
    marginBottom: height * 0.08, // Adjust margin-bottom based on screen height
    fontSize: scaleFont(17),
    marginTop: height * 0.03, // Adjust top margin for large screens
    fontWeight: '500',
    lineHeight: 23,
  },
  otpPromptText: {
    fontSize: scaleFont(16.5),
    marginBottom: height * 0.04, // Adjust margin-bottom for larger screens
    fontWeight: '400',
    color: 'green',
  },
  otpBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  input: {
    width: width * 0.12, // Dynamic width for better scalability
    height: width * 0.12, // Dynamic height to maintain square shape
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 79%)',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: scaleFont(18),
    backgroundColor: '#fff',
    elevation: 3,

  },
  resendcode: {
    marginTop: 25,
    paddingHorizontal: 20,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: hp('1.5%')
  },
  submitButton: {
    backgroundColor: 'green',
    height: height * 0.05,
    width: '80%', // Adjust width based on screen size
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginTop: height * 0.08, // Dynamic margin-top for large screens
  },
  submitButtonText: {
    fontSize: scaleFont(17),
    color: '#fff',
    fontWeight: '300',
  },
});

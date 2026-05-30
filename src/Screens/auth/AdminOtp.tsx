import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { router } from 'expo-router';
import HeaderComponent from '../../../src/components/HeaderComponent';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { addFormData } from '../../redux/slice/formSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { createBooking } from '../../api/PostApiBooking';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import base from '../../api/airtable';
import { verifyOtp } from '../../api/otp';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

// Font scaling utility function
const scaleFont = (size: number) => {
  const guidelineBaseWidth = 375; // Base screen width to scale from
  return (size * width) / guidelineBaseWidth;
};

const AdminOtp = ({ route }: { route: any }) => {
  const [otp, setOtp] = useState(['', '', '', '', '','']); // Manage OTP state
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const {
    name,
    number,
    selectedArea,
    selectedService,
    selectedBudget,
    selectedPriority,
    selectedShift,
    date,
    message,
  } = route.params;
  const navigation = useNavigation<any>();
  const dispatch: AppDispatch = useDispatch();

  // Clear OTP whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setOtp(['', '', '', '', '','']); // Reset OTP on screen focus
    }, []),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (text && index === otp.length - 1) {
      Keyboard.dismiss();
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
    if (enteredOtp.length < 5) {
      Alert.alert('Validation Error', 'Please enter the complete 5-digit verification code.');
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

      const newEntry = {
        id: Date.now(),
        name,
        number,
        selectedService,
        selectedShift,
        selectedPriority,
        selectedBudget,
        selectedArea,
        message,
        date: date instanceof Date ? date.toISOString() : date,
      };

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

      dispatch(addFormData(newEntry));

      router.push('/booking/BookingConfirm' as any);

    } catch (error) {
      console.log("BOOKING ERROR:", error);
      Alert.alert('Error', 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.mainContainer}>
      <HeaderComponent style={styles.header} />
      <View style={{ borderBottomWidth: 1, borderColor: '#CAD2DF', marginTop: 16 }} />

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

        <Text style={styles.resendcode}><Text style={{ color: 'blue' }}>Resend Code</Text></Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleNavigate}>
          <Text style={styles.submitButtonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: height * 0.09, // Adjust top padding based on screen size
    alignItems: 'center',
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
    fontSize: scaleFont(18.5),
    marginBottom: height * 0.04, // Adjust margin-bottom for larger screens
    fontWeight: '500',
    color: 'green',
  },
  otpBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
  },
  submitButton: {
    backgroundColor: 'green',
    height: height * 0.05,
    width: '60%', // Adjust width based on screen size
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: hp('2.0%'),
    paddingHorizontal: 15.7,
  },
});

export default AdminOtp;

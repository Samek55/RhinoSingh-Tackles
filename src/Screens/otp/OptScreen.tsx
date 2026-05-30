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
import HeaderComponent from '../../components/HeaderComponent';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const { width, height } = Dimensions.get('window'); 
import { useRoute } from '@react-navigation/native';
import { addFormData } from '../../redux/slice/formSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { createHelpbox } from '../../api/PostApiHelpbox';
import { verifyOtp } from '../../api/otp';
import { router } from 'expo-router';

const scaleFont = (size: number) => {
  const guidelineBaseWidth = 375; 
  return (size * width) / guidelineBaseWidth;
};

const OtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '']); 
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const route = useRoute<any>();
  const { phone } = route.params || {};
  const navigation = useNavigation<any>();
  const dispatch: AppDispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setOtp(['', '', '', '', '','']); 
    }, []),
  );

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
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNavigate = async () => {
    const enteredOtp = otp.join('');

    // Ensure they filled out all 5 boxes
    if (enteredOtp.length < 5) {
      Alert.alert('Validation Error', 'Please enter the complete 5-digit verification code.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Call your real Twilio Verify backend verification 
      console.log(`Verifying phone: ${phone} with code: ${enteredOtp}`);
      const verificationResult = await verifyOtp(phone, enteredOtp);

      // 2. Evaluate the live Twilio approval status response
      if (!verificationResult || !verificationResult.success || verificationResult.status !== 'approved') {
        Alert.alert('Verification Failed', 'The code entered is invalid or has expired.');
        setIsSubmitting(false);
        return;
      }

      // 3. Execution continues only if Twilio status strictly equaled 'approved'
      const newEntry = {
        id: Date.now(),
        phone
      };

      const booking = {
        "Phone": phone,
      };

      await createHelpbox(booking);
      dispatch(addFormData(newEntry as any));
      router.push('/otp/VerifiedScreen' as any);

    } catch (error) {
      console.log("BOOKING ERROR DURING VERIFICATION:", error);
      Alert.alert('Error', 'An error occurred during submission. Please try again.');
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
          Enter the 6 digits code sent to your customer number {phone ? phone : '98*****011'} below.
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

        <Text style={styles.resendcode}>Didn&apos;t get code? <Text style={{ color: 'blue' }}>Resend Code</Text></Text>

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
    </View>
    </TouchableWithoutFeedback>
  );
};

// ... keep styles exact same as your source snippet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: height * 0.09, 
    alignItems: 'center',
  },
  thankYouText: {
    marginTop: hp('3%'),
    fontSize: scaleFont(27),
    fontWeight: '500',
  },
  bookingText: {
    width: '70%',
    textAlign: 'center',
    marginBottom: height * 0.08, 
    fontSize: scaleFont(13),
    marginTop: height * 0.03, 
    fontWeight: '400',
    lineHeight: 23,
  },
  otpPromptText: {
    fontSize: scaleFont(16.5),
    marginBottom: height * 0.04, 
    fontWeight: '400',
    color: 'green',
  },
  otpBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  input: {
    width: width * 0.12, 
    height: width * 0.12, 
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
    width: '80%', 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginTop: height * 0.08, 
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

export default OtpScreen;

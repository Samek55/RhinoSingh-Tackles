import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Text,
  Alert
} from 'react-native';
import SubmitOverlay from '../../components/bookings/SubmitOverlay';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';

// IMPORT CUSTOM 2FACTOR API COMPONENT
import { sendOtp } from '../../api/otp/2factorOtp'; // Adjust this path to match your folder setup

const NumberBar = ({ onFocus = () => { } }) => {
  const [phone, setPhone] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'success'>('loading');
  const fontSize = wp('4.5%');

  const handleContinue = async () => {
    const structuralClean = phone.replace(/[^0-9]/g, '');

    console.log("--- 2FACTOR OTP TRIGGER DEBUG ---");
    console.log("Raw phone value:", phone);
    console.log("Stripped digits:", structuralClean);

    if (structuralClean.length !== 10) {
      Alert.alert('Phone number must be 10 digits', `You entered ${structuralClean.length} digits.`);
      return;
    }

    try {
      setOverlayStatus('loading');
      setOverlayVisible(true);

      const formattedPhone = '+91' + structuralClean; 
      console.log("Sending 2Factor SMS to target:", formattedPhone);

      // Trigger 2Factor integration instead of Firebase
      const result = await sendOtp(formattedPhone);

      if (result.Status === 'Success') {
        console.log("2Factor SMS initialized successfully! Session ID:", result.Details);
        setOverlayVisible(false);

        // Forward both the clean phone number and the 2Factor validation Session ID string
        router.push({
          pathname: '/helpbox/helpboxOTP',
          params: { 
            phone: structuralClean,
            sessionId: result.Details // Pass this along to verify it on the next screen
          },
        });
      } else {
        throw new Error(result.Details);
      }

    } catch (error: any) {
      setOverlayVisible(false);
      console.error("CRITICAL 2FACTOR TRACE:", error);

      Alert.alert(
        'System Dispatch Error',
        error.message || 'An unhandled exception blocked the 2Factor delivery pipeline.'
      );
    }
  };

  return (
    <View style={[styles.container, { width: wp('75%') }]}>
      <SubmitOverlay
        visible={overlayVisible}
        status={overlayStatus}
        onClose={() => setOverlayVisible(false)}
        onClear={() => setOverlayVisible(false)}
      />
      <View style={styles.phoneContainer}>
        <Image
          source={require('../../assets/header/right.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <View style={styles.inputContainer}>
          <TextInput
            onFocus={() => onFocus?.()}
            value={phone}
            onChangeText={(text) => {
              let cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
              let formatted = cleaned;
              if (cleaned.length > 3 && cleaned.length <= 6) {
                formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
              } else if (cleaned.length > 6) {
                formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
              }
              setPhone(formatted);
            }}
            placeholder="787 125 8006"
            placeholderTextColor="#999"
            style={[styles.input, { fontSize }]}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleContinue} style={styles.helpButton}>
        <Text style={styles.helpText}> Help </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp('5%'),
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0E61CD',
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: '100%',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: wp('3%'),
  },
  icon: {
    height: hp('3%'),
    width: wp('5.5%'),
    marginRight: wp('2%'),
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    color: '#4B4B4B',
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    fontSize: wp('3.8%'),
  },
  helpButton: {
    backgroundColor: '#0E61CD',
    paddingHorizontal: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: wp('3.5%'),
  },
});

export default NumberBar;
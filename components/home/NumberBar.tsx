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
import { sendOtp } from '../../api/otp';
import { router } from 'expo-router';

const NumberBar = ({ onFocus = () => {} }) => {
  const [phone, setPhone] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'success'>('loading');
  const fontSize = wp('4.5%');

  // always derive clean value inside render
  const cleanPhone = phone.replace(/\s/g, '');

  const handleContinue = async () => {
    if (cleanPhone.length !== 10) {
      Alert.alert('Phone number must be 10 digits');
      return;
    }

    try {
      setOverlayStatus('loading');
      setOverlayVisible(true);

      const formattedPhone = '+977' + cleanPhone;

      const res = await sendOtp(formattedPhone);

      if (!res?.success) {
        setOverlayVisible(false);
        Alert.alert('Error', 'Failed to send OTP');
        return;
      }

      //  go immediately (NO success screen)
      setOverlayVisible(false);

      router.push({
        pathname: '/helpbox/helpboxOTP',
        params: { phone: formattedPhone },
      });

    } catch (error) {
      setOverlayVisible(false);
      Alert.alert('Error', 'Something went wrong');
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
      {/* Left side input */}
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
                formatted =
                  cleaned.slice(0, 3) +
                  ' ' +
                  cleaned.slice(3, 6) +
                  ' ' +
                  cleaned.slice(6);
              }

              setPhone(formatted);
            }}
            placeholder="240 345 7466"
            placeholderTextColor="#999"
            style={[styles.input, { fontSize }]}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Help button */}
      <TouchableOpacity
        onPress={handleContinue}
        style={styles.helpButton}
      >
        <Text style={styles.helpText}> Help </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp('5%'),
    borderRadius: 25,          // more pill-shaped
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
    textAlign: 'center',         // left align looks cleaner
    includeFontPadding: false,
    fontSize: wp('3.8%'),
  },

  helpButton: {
    backgroundColor: '#0E61CD',
    paddingHorizontal: wp('4%'), // padding instead of fixed width
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
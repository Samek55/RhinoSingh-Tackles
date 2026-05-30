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

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { sendOtp } from '../../api/otp';

const NumberBar = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');

  const fontSize = wp('4.5%');

  // always derive clean value inside render
  const cleanPhone = phone.replace(/\s/g, '');

  const handleContinue = async () => {
  if (cleanPhone.length !== 10) {
    Alert.alert('Phone number must be 10 digits');
    return;
  }

  try {
    // convert to E.164 format (IMPORTANT for Twilio)
    const formattedPhone = '+977' + cleanPhone;

    const res = await sendOtp(formattedPhone);

    if (!res?.success) {
      Alert.alert('Error', 'Failed to send OTP');
      return;
    }

    // navigate only after OTP sent
    navigation.navigate('OTP', { phone:  formattedPhone });

  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Something went wrong');
  }
};

  return (
    <View style={[styles.container, { width: wp('75%') }]}>

      {/* Left side input */}
      <View style={styles.phoneContainer}>
        <Image
          source={require('../../assets/image/header/right.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <TextInput
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
            placeholder="981 234 5678"
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
    height: hp('4.5%'),
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#0E61CD',
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: '#fff',

  },

  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: wp('2%'),
  },

  icon: {
    height: hp('4%'),
    width: wp('7%'),
    marginRight: wp('2%'),
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  input: {
    width: '100%',
    color: '#4B4B4B',
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,

  },

  helpButton: {
    backgroundColor: '#0E61CD',
    width: wp('20%'),
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
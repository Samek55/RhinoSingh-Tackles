import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Text,
  Alert,
  Platform
} from 'react-native';
import SubmitOverlay from '../../components/bookings/SubmitOverlay';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';

// 1. MODULAR SDK IMPORTS
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

// Exported global placeholder for screen orchestration
export let globalFirebaseConfirmation: any = null;

const NumberBar = ({ onFocus = () => { } }) => {
  const [phone, setPhone] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'success'>('loading');
  const fontSize = wp('4.2%'); 

  const cleanPhone = phone.replace(/\s/g, '');

  const handleContinue = async () => {
    // 1. Force remove everything except digits just in case
    const structuralClean = phone.replace(/[^0-9]/g, '');

    console.log("--- OTP TRIGGER DEBUG ---");
    console.log("Raw state phone value:", phone);
    console.log("Stripped clean digits:", structuralClean);

    if (structuralClean.length !== 10) {
      Alert.alert('Phone number must be 10 digits', `You entered ${structuralClean.length} digits.`);
      return;
    }

    try {
      setOverlayStatus('loading');
      setOverlayVisible(true);

      const formattedPhone = '+977' + structuralClean;
      console.log("Sending SMS to target:", formattedPhone);

      const authInstance = getAuth();

      // 2. Wrap execution directly
      const confirmation = await signInWithPhoneNumber(authInstance, formattedPhone);

      console.log("Firebase SMS successfully initialized!", confirmation);
      globalFirebaseConfirmation = confirmation;

      setOverlayVisible(false);

      router.push({
        pathname: '/helpbox/helpboxOTP',
        params: { phone: structuralClean },
      });

    } catch (error: any) {
      setOverlayVisible(false);

      // 3. FORCE print full system diagnostics to your terminal log 
      console.error("CRITICAL FIREBASE TRACE:", JSON.stringify(error, null, 2));

      // Fallback native window alert breakdown
      Alert.alert(
        'System Dispatch Error',
        error.message || 'An unhandled exception blocked the Firebase pipeline.'
      );
    }
  };

  return (
    <View style={[styles.container, { width: wp('86%') }]}> 
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
            placeholder="819 007 4189"
            placeholderTextColor="#94A3B8"
            style={[styles.input, { fontSize }]}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleContinue} 
        style={styles.helpButton}
        activeOpacity={0.82}
      >
        <Text style={styles.helpText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp('6.6%'), 
    borderRadius: 100, // Complete geometric rounding regardless of device layout
    borderWidth: 1.5,
    borderColor: '#1E293B', // Dark, high-contrast border for high visual quality
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingLeft: wp('1.5%'),
    paddingRight: wp('2%'),
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: wp('4%'), 
    paddingRight: wp('2%'),
    height: '100%',
  },
  icon: {
    height: hp('2.4%'),
    width: wp('5.2%'),
    marginRight: wp('3%'),
    opacity: 0.75, // Keeps iconography sleek and un-cluttered
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  input: {
    width: '100%',
    color: '#0F172A', 
    fontWeight: '700', // Bolder typography weights for visibility
    textAlign: 'left', 
    includeFontPadding: false,
    letterSpacing: 1.2, 
    paddingVertical: 0,
    marginLeft:10
  },
  helpButton: {
    backgroundColor: '#075f47',
    paddingHorizontal: wp('6.5%'), 
    height: '85%', // Floats nicely within the outer border architecture
    borderRadius: 100, 
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#075f47',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  helpText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: wp('3.8%'),
    letterSpacing: 0.5,
  },
});

export default NumberBar;
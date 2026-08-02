import React, { useState } from 'react';
import {
  View,
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
import { createHelpboxSB } from '@/api/supabase/createHelpboxSB';
import { notifyAdminHelpbox } from '@/api/notifications';
import { useCountry } from '@/src/context/countryContext';
import { formatLocalPhone } from '@/src/constants/countryData';

// Global Firebase Confirmation Store
export let globalFirebaseConfirmation: any = null;
export const setGlobalFirebaseConfirmation = (confirmation: any) => {
  globalFirebaseConfirmation = confirmation;
};

const NumberBar = ({ onFocus = () => { } }) => {
  const { countryInfo } = useCountry();
  const [phone, setPhone] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'success'>('loading');
  const fontSize = wp('4.2%');

  const placeholder = countryInfo.phone ? formatLocalPhone(countryInfo.phone) : '819 007 4189';

  const handleContinue = async () => {
    // Force remove everything except digits
    const structuralClean = phone.replace(/[^0-9]/g, '');

    if (structuralClean.length !== 10) {
      Alert.alert('Phone number must be 10 digits', `You entered ${structuralClean.length} digits.`);
      return;
    }

    try {
      setOverlayStatus('loading');
      setOverlayVisible(true);

      const formattedPhone = countryInfo.dialCode + structuralClean;

      // 💾 Construct payload and write records directly to Supabase DB node
      const payload = {
        phone: formattedPhone,
        date_created: new Date().toISOString() // Dynamic current date timestamp
      };

      await createHelpboxSB(payload);

      notifyAdminHelpbox(formattedPhone);

      setOverlayVisible(false);

      // 🔀 Route cleanly without parameter signatures to target location
      router.push('/helpbox/otpVerifiedHB');

    } catch (error: any) {
      setOverlayVisible(false);
      console.error("CRITICAL SUPABASE TRACE:", error.message);
      Alert.alert(
        'Database Write Error',
        error.message || 'An unhandled exception blocked the database update pipeline.'
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
        <View style={styles.iconCircle}>
          <Text style={styles.flagEmoji}>{countryInfo.flag}</Text>
        </View>
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
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            style={[styles.input, { fontSize }]}
            keyboardType="numeric"
            maxLength={12} 
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
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#1E293B',
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
  iconCircle: {
    height: hp('3.6%'),
    width: hp('3.6%'),
    borderRadius: hp('1.8%'),
    marginRight: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  flagEmoji: {
    fontSize: hp('2.4%'),
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  input: {
    width: '100%',
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'left',
    includeFontPadding: false,
    letterSpacing: 1.2,
    paddingVertical: 0,
    marginLeft: 10
  },
  helpButton: {
    backgroundColor: '#064E3B',
    paddingHorizontal: wp('6.5%'),
    height: '85%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#064E3B',
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
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Header2 from '@/components/Header2';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useState } from "react";
import SubmitOverlay from "@/components/bookings/SubmitOverlay";

// 1. IMPORT MODULAR FIREBASE AUTH METHODS
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

// 2. EXPORT THE MEMORY HOLDER VARIABLE FOR SCREEN ORCHESTRATION
export let globalBookingFirebaseConfirmation: any = null;

const { width } = Dimensions.get('window');

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

export default function BookingDetails() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'success'>('loading');
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

  const formattedDate = date
    ? new Date(date as string).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleSubmit = async () => {
    const cleanNumber = String(number || '').replace(/[^0-9]/g, '');

    if (cleanNumber.length !== 10) {
      Alert.alert('Validation Error', 'The associated phone number must be exactly 10 digits.');
      return;
    }

    try {
      setOverlayStatus('loading');
      setOverlayVisible(true);

      const formattedPhone = '+977' + cleanNumber;
      console.log("Initializing Firebase SMS to:", formattedPhone);

      const authInstance = getAuth();
      const confirmation = await signInWithPhoneNumber(authInstance, formattedPhone);

      globalBookingFirebaseConfirmation = confirmation;
      setOverlayVisible(false);

      router.push({
        pathname: '/booking/BookingOtp',
        params: {
          name,
          number: cleanNumber,
          selectedService,
          selectedShift,
          selectedArea,
          selectedPriority,
          selectedBudget,
          message,
          date,
        },
      });

    } catch (error: any) {
      setOverlayVisible(false);
      console.log("FIREBASE BOOKING SMS ERROR:", error);
      Alert.alert('SMS Dispatch Error', error.message || 'Something went wrong while sending the code.');
    }
  };

  return (
    <LinearGradient colors={['#064E3B', '#022C22']} style={styles.screen}>
      <Header2 />
      <SubmitOverlay
        visible={overlayVisible}
        status={overlayStatus}
        onClose={() => setOverlayVisible(false)}
        onClear={() => setOverlayVisible(false)}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleArea}>
          <Text style={styles.title}>Booking Summary</Text>
          <Text style={styles.subtitle}>
            Review your details before confirming
          </Text>
        </View>

        <View style={styles.card}>
          <Row label="Full Name" value={name as string} />
          <View style={styles.divider} />
          <Row label="Phone Number" value={number as string} />
          <View style={styles.divider} />
          <Row label="Service" value={selectedService as string} />
          <View style={styles.divider} />
          <Row label="Date" value={formattedDate} />
          <View style={styles.divider} />
          <Row label="Preferred Time" value={selectedShift as string} />
          <View style={styles.divider} />
          <Row label="Location" value={selectedArea as string} />
          <View style={styles.divider} />
          <Row label="Priority" value={selectedPriority as string} />
          <View style={styles.divider} />
          <Row label="Budget" value={selectedBudget as string} />
          
          {message ? (
            <>
              <View style={styles.divider} />
              <View style={styles.messageBlock}>
                <Text style={styles.messageLabel}>Special Instructions</Text>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={styles.confirmBtn} 
            activeOpacity={0.9}
          >
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/Book')}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>Edit Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
  },
  container: { 
    paddingHorizontal: width * 0.05, 
    paddingBottom: hp('6%'),
  },
  titleArea: { 
    paddingTop: hp('2.5%'), 
    paddingBottom: hp('3%'), 
    paddingHorizontal: 4,
  },
  title: { 
    fontSize: width * 0.07, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: width * 0.036, 
    color: 'rgba(255, 255, 255, 0.7)', 
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    // Soft, premium shadow system
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: hp('4%'),
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: hp('2%'),
  },
  rowLabel: { 
    fontSize: wp('3.6%'), 
    color: '#6B7280', // Tailwind Gray 500
    fontWeight: '500', 
    flex: 1,
  },
  rowValue: { 
    fontSize: wp('3.8%'), 
    color: '#111827', // Tailwind Gray 900
    fontWeight: '600', 
    flex: 1.8, 
    textAlign: 'right',
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F3F4F6', // Crisp subtle separation 
  },
  messageBlock: { 
    paddingVertical: hp('2%'), 
    gap: 6,
  },
  messageLabel: {
    fontSize: wp('3.6%'), 
    color: '#6B7280',
    fontWeight: '500',
  },
  messageText: { 
    fontSize: wp('3.6%'), 
    color: '#374151', 
    fontWeight: '400', 
    lineHeight: 22,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  buttonGroup: {
    gap: hp('1.5%'),
  },
  confirmBtn: { 
    backgroundColor: 'green', // Clean Emerald Green accent
    height: hp('6.5%'), 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmBtnText: { 
    color: '#FFFFFF', 
    fontSize: wp('4.2%'), 
    fontWeight: '700', 
    letterSpacing: 0.2,
  },
  backBtn: { 
    height: hp('6.5%'), 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  backBtnText: { 
    color: '#FFFFFF', 
    fontSize: wp('4.2%'), 
    fontWeight: '600',
  },
});
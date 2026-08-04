import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Header2 from '@/components/Header2';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import React, { useState } from "react";
import SubmitOverlay from "@/components/bookings/SubmitOverlay";

// 🎛️ API & Supabase Integration Methods
import { notifyProfessionals } from '../../../../api/notifications';
import { OneSignal } from 'react-native-onesignal';
import { createBookingSupabase } from '@/api/supabase/createBookingSupabase';
import { useCountry } from '@/src/context/countryContext';
import { sparrowOtpService } from '@/src/services/sparrowOtpService';

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
  const { country, countryInfo } = useCountry();

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
    fileUrls, // Get file URLs from params
  } = useLocalSearchParams();

  // Parse file URLs
  const uploadedFiles = fileUrls ? JSON.parse(fileUrls as string) : [];

  const formattedDate = date
    ? new Date(date as string).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Helper function to format timestamp records cleanly
  const formatDate = (dateValue: any) => {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) 
      ? new Date().toISOString().split('T')[0] 
      : parsedDate.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    const cleanNumber = String(number || '').replace(/[^0-9]/g, '');

    if (cleanNumber.length !== 10) {
      Alert.alert('Validation Error', 'The associated phone number must be exactly 10 digits.');
      return;
    }

    if (country === 'nepal') {
      try {
        setOverlayStatus('loading');
        setOverlayVisible(true);

        const otp = sparrowOtpService.generateOtp();
        const fullPhone = countryInfo.dialCode.replace('+', '') + cleanNumber;
        const sent = await sparrowOtpService.sendOtp(fullPhone, otp, name ? String(name) : undefined);

        setOverlayVisible(false);

        if (!sent) {
          Alert.alert('Submission Failed', 'Could not send the verification code. Please try again.');
          return;
        }

        sparrowOtpService.setPendingOtp('booking', { otp, phone: fullPhone });

        router.push({
          pathname: '/booking/BookingOtp',
          params: {
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
          },
        });
      } catch (error: any) {
        setOverlayVisible(false);
        console.error('SPARROW OTP SEND ERROR:', error);
        Alert.alert('Submission Failed', error.message || 'Could not send the verification code.');
      }
      return;
    }

    try {
      setOverlayStatus('loading');
      setOverlayVisible(true);

      // 1. OneSignal User Identifier Syncing
      if (cleanNumber) {
        try {
          OneSignal.login(cleanNumber);
          setTimeout(() => {
            const assignedRole = role ? String(role) : 'user';
            OneSignal.User.addTags({
              role: assignedRole,
              phone: cleanNumber,
            });
            console.log(`OneSignal tags updated directly: role=${assignedRole}`);
          }, 800);
        } catch (e) {
          console.warn("OneSignal profile tracking step skipped:", e);
        }
      }

      // 2. Structuring Supabase Data Entry Mapping
      const booking = {
        full_name: name ? String(name) : '',
        phone: cleanNumber,
        city: selectedLocation ? String(selectedLocation) : '',
        area: selectedArea ? [String(selectedArea)] : [],
        select_services: selectedService ? [String(selectedService)] : [],
        priority: selectedPriority ? String(selectedPriority) : 'Normal',
        select_shift: selectedShift ? String(selectedShift) : '',
        work_description: message ? String(message) : '',
        budget: selectedBudget ? String(selectedBudget) : '',
        service_booking_datetime: formatDate(date),
        status: "New / Open",
        // Add file URLs to the booking data if needed
        add_photos_picture: uploadedFiles,
      };

      // 3. Complete Database Entry Creation Task
      await createBookingSupabase(booking);
      console.log("Supabase booking record inserted smoothly.");

      // 4. Trigger Downstream Provider Alerts 
      try {
        const targetService = Array.isArray(selectedService) ? selectedService[0] : selectedService;
        const targetArea = Array.isArray(selectedArea) ? selectedArea[0] : selectedArea;

        if (targetService && targetArea) {
          await notifyProfessionals(
            String(targetService).trim(),
            String(targetArea).trim()
          );
        }
      } catch (e) {
        console.warn("Background structural professional dispatch notification delayed:", e);
      }

      setOverlayVisible(false);

      // 5. Clean parameterless screen change routing execution
      router.push('/booking/BookingVerify');

    } catch (error: any) {
      setOverlayVisible(false);
      console.error("CRITICAL DIRECT BOOKING INTERACTION ERROR:", error);
      Alert.alert(
        'Submission Failed', 
        error.message || 'An unhandled asset pipeline error blocked processing.'
      );
    }
  };

  // Render uploaded images
  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageItemContainer}>
      <Image source={{ uri: item }} style={styles.uploadedImage} resizeMode="cover" />
      <View style={styles.imageNumberBadge}>
        <Text style={styles.imageNumberText}>{index + 1}</Text>
      </View>
    </View>
  );

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
          <Row label="City" value={selectedLocation as string} />
          <View style={styles.divider} />
          <Row label="Area" value={selectedArea as string} />
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

          {/* Display uploaded photos */}
          {uploadedFiles.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.photosSection}>
                <Text style={styles.photosLabel}>
                  Uploaded Photos ({uploadedFiles.length})
                </Text>
                <FlatList
                  data={uploadedFiles}
                  renderItem={renderImageItem}
                  keyExtractor={(item, index) => `photo-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photosList}
                />
              </View>
            </>
          )}
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
    color: '#6B7280', 
    fontWeight: '500', 
    flex: 1,
  },
  rowValue: { 
    fontSize: wp('3.8%'), 
    color: '#111827', 
    fontWeight: '600', 
    flex: 1.8, 
    textAlign: 'right',
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F3F4F6', 
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
  photosSection: {
    paddingVertical: hp('2%'),
  },
  photosLabel: {
    fontSize: wp('3.6%'),
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: hp('1%'),
  },
  photosList: {
    paddingVertical: 4,
    gap: 10,
  },
  imageItemContainer: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadedImage: {
    width: wp('20%'),
    height: hp('10%'),
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imageNumberBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  buttonGroup: {
    gap: hp('1.5%'),
  },
  confirmBtn: { 
    backgroundColor: '#10B981', 
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
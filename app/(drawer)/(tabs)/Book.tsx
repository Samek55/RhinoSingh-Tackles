import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Dropdown from '../../../components/bookings/Dropdown';
import { area, services, shifts, budget, priority } from '../../../src/data/Data';
import DateTimePicker from '@react-native-community/datetimepicker';
import CalenderIcon from '../../../assets/icons/booking/calendar.png';
import TextArea from '../../../components/bookings/TextArea';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import countryLogo from '../../../assets/header/right.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import Header2 from '@/components/Header2';
import ClearFormIcon from '../../../assets/icons/booking/clear.png';
import FileUploadBox from '@/components/bookings/FileUploadBox';
import { FileItem } from '../Partnership';
import { uploadMultipleImagesForBooking } from '@/src/utils/fileUploadBooking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Button = ({ children, style, textStyle, onPress, disabled }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.submitBtn,
        style
      ]}
    >
      <Text style={[styles.submitBtnText, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default function ServiceBookingScreen() {
  const scrollRef = useRef<any>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAddPhotos, setSelectAddPhotos] = useState<FileItem[]>([]);

  const clearAllFields = () => {
    setName('');
    setNumber('');
    setSelectedService('');
    setSelectedShift('');
    setDate(null);
    setSelectedArea('');
    setSelectedPriority('');
    setSelectedBudget('');
    setMessage('');
    setActiveInput(null);
    setSelectAddPhotos([]);
  };

  const handleClearForm = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Clear', style: 'destructive', onPress: clearAllFields },
      ]
    );
  };

 const handleSubmit = async () => {
  const cleanNumber = number.replace(/\s/g, '');

  if (!name.trim()) { 
    return Alert.alert('Validation Error', 'Full Name is required'); 
  }
  if (!cleanNumber || cleanNumber.length !== 10) { 
    return Alert.alert('Validation Error', 'Enter a valid 10-digit phone number'); 
  }
  if (!selectedService) { 
    return Alert.alert('Validation Error', 'Please select a service'); 
  }
  if (!date) { 
    return Alert.alert('Validation Error', 'Please select a date'); 
  }
  if (!selectedShift) { 
    return Alert.alert('Validation Error', 'Please choose a time shift'); 
  }
  if (!selectedArea) { 
    return Alert.alert('Validation Error', 'Please select your location'); 
  }
  if (!selectedBudget.trim()) { 
    return Alert.alert('Validation Error', 'Budget cannot be empty'); 
  }
  if (!selectedPriority.trim()) { 
    return Alert.alert('Validation Error', 'Please choose a Priority'); 
  }
  
  // Validate photos - uses the maxFiles from the component
  if (selectAddPhotos.length === 0) {
    return Alert.alert('Validation Error', 'Please upload at least 1 photo');
  }
  if (selectAddPhotos.length > 5) { // You can make this dynamic too if needed
    return Alert.alert('Validation Error', 'Maximum 5 photos allowed');
  }


  setIsSubmitting(true);

  try {
    // Get user ID from AsyncStorage or generate a temporary one
    let userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}`;
      await AsyncStorage.setItem('userId', userId);
    }

    // Generate booking ID
    const bookingId = `booking_${Date.now()}`;

    // Upload files to Supabase
    const fileUrls = await uploadMultipleImagesForBooking(selectAddPhotos);
    
    if (fileUrls.length === 0) {
      throw new Error('Failed to upload files');
    }

    // Navigate to booking detail with file URLs
    router.push({
      pathname: '/booking/BookingDetail',
      params: {
        name: name.trim(),
        number: cleanNumber,
        selectedService,
        selectedShift,
        selectedArea,
        selectedPriority,
        selectedBudget,
        message: message.trim(),
        date: date.toISOString(),
        fileUrls: JSON.stringify(fileUrls),
        bookingId: bookingId,
      },
    });
  } catch (error) {
    console.log('Submission error:', error);
    Alert.alert('Error', 'Failed to submit booking. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <LinearGradient colors={['#064E3B', '#022C22']} style={styles.screen}>
      <Header2 />
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        resetScrollToCoords={undefined}
        enableAutomaticScroll
        keyboardDismissMode="on-drag"
      >
        <View style={styles.formContainer}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>Book a Service</Text>
            <Text style={styles.subtitle}>Fill out the parameters below to arrange your request</Text>
          </View>

          <View style={styles.inputCard}>
            {/* Full Name */}
            <Text style={styles.label}>Full Name<Text style={styles.required}> *</Text></Text>
            <TextInput
              placeholder="Enter your Full Name"
              value={name}
              onChangeText={setName}
              onFocus={() => setActiveInput('name')}
              onBlur={() => setActiveInput(null)}
              style={[styles.input, activeInput === 'name' && styles.inputActive]}
              placeholderTextColor={'#9CA3AF'}
              maxLength={30}
            />

            {/* Phone Number */}
            <Text style={styles.label}>Phone Number<Text style={styles.required}> *</Text></Text>
            <View style={styles.phoneContainer}>
              <Image source={countryLogo} style={styles.countryIcon} resizeMode="contain" />
              <TextInput
                placeholder="Enter your Phone Number"
                value={number}
                onFocus={() => setActiveInput('phone')}
                onBlur={() => setActiveInput(null)}
                onChangeText={(value) => {
                  let cleaned = value.replace(/[^0-9]/g, '');
                  cleaned = cleaned.slice(0, 10);
                  let formatted = cleaned;

                  if (cleaned.length > 3 && cleaned.length <= 6) {
                    formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
                  } else if (cleaned.length > 6) {
                    formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
                  }
                  setNumber(formatted);
                }}
                keyboardType="number-pad"
                style={[styles.phoneInput, activeInput === 'phone' && styles.inputActive]}
                placeholderTextColor={'#9CA3AF'}
                maxLength={12}
              />
            </View>

            {/* Select Service */}
            <Text style={styles.label}>Select a Service<Text style={styles.required}> *</Text></Text>
            <Dropdown
              value={selectedService}
              options={services}
              placeholder="Select any One Service"
              placeholderColor="#9CA3AF"
              onSelectOption={setSelectedService}
              onOpen={() => setActiveInput('service')}
              onClose={() => setActiveInput(null)}
            />

            {/* Choose Date */}
            <Text style={styles.label}>Choose Date<Text style={styles.required}> *</Text></Text>
            <View style={{ marginBottom: height * 0.02 }}>
              <TouchableOpacity
                onPress={() => {
                  setShow(true);
                  setActiveInput('date');
                }}
                style={[styles.datePicker, activeInput === 'date' && styles.inputActive]}
              >
                <Text style={[styles.datePickerText, { color: date ? '#111827' : '#9CA3AF' }]}>
                  {date ? date.toDateString() : 'Pick a Date'}
                </Text>
                <Image
                  source={CalenderIcon}
                  style={[styles.calendarIcon, { tintColor: activeInput === 'date' ? '#10B981' : '#000' }]}
                />
              </TouchableOpacity>

              {show && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShow(Platform.OS === 'ios');
                    if (Platform.OS === 'android') { setActiveInput(null); }
                    if (event.type === 'set' && selectedDate) { setDate(selectedDate); }
                  }}
                />
              )}
            </View>

            {/* Preferred Time */}
            <Text style={styles.label}>Preferred Time<Text style={styles.required}> *</Text></Text>
            <Dropdown
              options={shifts}
              placeholder="Choose a Shift"
              placeholderColor="#9CA3AF"
              onSelectOption={setSelectedShift}
              dropdownType="shift"
              onOpen={() => setActiveInput('shift')}
              onClose={() => setActiveInput(null)}
              value={selectedShift}
            />

            {/* Your Location */}
            <Text style={styles.label}>Your Location<Text style={styles.required}> *</Text></Text>
            <Dropdown
              options={area}
              placeholder="Select your Location"
              placeholderColor="#9CA3AF"
              onSelectOption={setSelectedArea}
              onOpen={() => setActiveInput('location')}
              onClose={() => setActiveInput(null)}
              value={selectedArea}
            />

            {/* Priority */}
            <Text style={styles.label}>Priority<Text style={styles.required}> *</Text></Text>
            <Dropdown
              options={priority}
              placeholder="Select Priority"
              placeholderColor="#9CA3AF"
              onSelectOption={setSelectedPriority}
              value={selectedPriority}
              onOpen={() => setActiveInput('priority')}
              onClose={() => setActiveInput(null)}
            />

            {/* Select Budget */}
            <Text style={styles.label}>Select Budget<Text style={styles.required}> *</Text></Text>
            <Dropdown
              value={selectedBudget}
              options={budget}
              placeholder="Select Budget"
              placeholderColor="#9CA3AF"
              onSelectOption={setSelectedBudget}
              onOpen={() => setActiveInput('budget')}
              onClose={() => setActiveInput(null)}
            />

            <Text style={styles.label}>Photos <Text style={{ fontSize: wp('3.6%'), fontWeight: '400', color: '#374151' }}>(Up to 5)</Text><Text style={styles.required}> *</Text></Text>
            <FileUploadBox value={selectAddPhotos} onChange={setSelectAddPhotos} maxFiles={5} />

            {/* Message */}
            <Text style={styles.label}>Message</Text>
            <TextArea
              value={message}
              onChangeText={setMessage}
              placeholder="Provide specific notes or special context here..."
              placeholderTextColor="#9CA3AF"
              maxHeight={140}
              onFocus={() => setActiveInput('message')}
              onBlur={() => setActiveInput(null)}
              style={activeInput === 'message' ? styles.inputActive : undefined}
            />

            {/* Form Actions */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.buttonClearFlex} onPress={handleClearForm}>
                <Image source={ClearFormIcon} style={styles.clearIcon} />
                <Text style={styles.buttonClear}>Clear form</Text>
              </Pressable>

              <Button
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={styles.buttonSubmit}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : 'SUBMIT'}
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.015,
  },
  titleArea: {
    paddingBottom: hp('2.5%'),
    paddingHorizontal: 4,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: width * 0.034,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  inputCard: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('3%'),
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: hp('6%'),
  },
  label: {
    marginBottom: hp('0.8%'),
    paddingLeft: 2,
    fontSize: wp('3.6%'),
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: width * 0.04,
    height: hp('6%'),
    marginBottom: height * 0.02,
    fontSize: wp('3.8%'),
    fontWeight: '500',
    borderColor: '#E5E7EB',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  phoneContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  countryIcon: {
    width: wp('7%'),
    height: hp('3%'),
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  phoneInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    borderColor: '#E5E7EB',
    height: hp('6%'),
    paddingLeft: wp('14%'),
    paddingRight: 14,
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: width * 0.04,
    height: hp('6%'),
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
  },
  calendarIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  submitBtn: {
    width: width * 0.4,
    height: height * 0.058,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: wp('4.2%'),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonSubmit: {
    width: width * 0.4,
    height: height * 0.058,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 40,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonClear: {
    color: '#0a7de1',
    fontSize: width * 0.038,
    fontWeight: '500',
  },
  buttonClearFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  clearIcon: {
    width: wp('6%'),
    height: hp('2.5%'),
    resizeMode: 'contain',
    marginRight: 4,
  },
});
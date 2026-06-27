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

    if (!name.trim()) { return Alert.alert('Validation Error', 'Full Name is required'); }
    if (!cleanNumber || cleanNumber.length !== 10) { return Alert.alert('Validation Error', 'Enter a valid 10-digit phone number'); }
    if (!selectedService) { return Alert.alert('Validation Error', 'Please select a service'); }
    if (!date) { return Alert.alert('Validation Error', 'Please select a date'); }
    if (!selectedShift) { return Alert.alert('Validation Error', 'Please choose a time shift'); }
    if (!selectedArea) { return Alert.alert('Validation Error', 'Please select your location'); }
    if (!selectedBudget.trim()) { return Alert.alert('Validation Error', 'Budget cannot be empty'); }
    if (!selectedPriority.trim()) { return Alert.alert('Validation Error', 'Please choose a Priority'); }

    setIsSubmitting(true);

    try {
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
        },
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
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
            <Text style={styles.label}>Select Service<Text style={styles.required}> *</Text></Text>
            <Dropdown
              value={selectedService}
              options={services}
              placeholder="Select Services"
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

            {/* Submit Button */}
            <View style={styles.buttonPadding}>
              <Button
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : 'SUBMIT'}
              </Button>
            </View>

            {/* Clear Form Option */}
            <Pressable style={styles.buttonClearFlex} onPress={handleClearForm}>
              <Image source={ClearFormIcon} style={styles.clearIcon} />
              <Text style={styles.buttonClear}>Clear form</Text>
            </Pressable>

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
    color: '#374151', // Gray 700
  },
  required: { 
    color: '#EF4444', // Warm red
  },
  input: { 
    borderWidth: 1.5, 
    borderRadius: 14, 
    paddingHorizontal: width * 0.04, 
    height: hp('6%'), 
    marginBottom: height * 0.02, 
    fontSize: wp('3.8%'), 
    fontWeight: '500', 
    borderColor: '#E5E7EB', // Gray 200
    color: '#111827', 
    backgroundColor: '#FFFFFF',
  },
  inputActive: { 
    borderColor: '#10B981', // Matching active Emerald tone
    backgroundColor: '#F0FDF4', // Emerald-tinted light fill
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
  buttonPadding: { 
    marginTop: hp('2%'), 
    alignItems: 'center', 
    width: '100%',
  },
  submitBtn: { 
    width: '50%', 
    height: hp('6.5%'), 
    backgroundColor: '#064E3B', // Emerald accent primary
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 16,
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
  buttonClearFlex: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: hp('2%'), 
    justifyContent: 'center',
    padding: 8,
  },
  buttonClear: {  
    fontSize: wp('3.6%'), 
    fontWeight: '600', 
    color: '#6B7280',
  },
  clearIcon: { 
    width: 18, 
    height: 18, 
    tintColor: '#9CA3AF', 
    resizeMode: 'contain', 
    marginRight: 6,
  },
});
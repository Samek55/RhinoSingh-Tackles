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
} from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Header2 from '@/components/Header2';

const { width, height } = Dimensions.get('window');

const Button = ({ children, style, textStyle, onPress }: any) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={['#047857', '#15803d', '#65a30d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button1, style]}
      >
        <Text style={[styles.text, textStyle]}>
          {children}
        </Text>
      </LinearGradient>
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

  // New tracking states for handling matching active design glows
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const handleSubmit = async () => {
    const cleanNumber = number.replace(/\s/g, '');

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required');
      return;
    }
    if (!cleanNumber || cleanNumber.length !== 10) {
      Alert.alert('Validation Error', 'Enter a valid 10-digit phone number');
      return;
    }
    if (!selectedService) {
      Alert.alert('Validation Error', 'Please select a service');
      return;
    }
    if (!date) {
      Alert.alert('Validation Error', 'Please select a date');
      return;
    }
    if (!selectedShift) {
      Alert.alert('Validation Error', 'Please choose a time shift');
      return;
    }
    if (!selectedArea) {
      Alert.alert('Validation Error', 'Please select your location');
      return;
    }
    if (!selectedBudget.trim()) {
      Alert.alert('Validation Error', 'Budget cannot be empty');
      return;
    }
    if (!selectedPriority.trim()) {
      Alert.alert('Validation Error', 'Please choose a Priority');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Validation Error', 'Message cannot be empty');
      return;
    }

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
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'teal' }}>
      <Header2 />
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        resetScrollToCoords={undefined}
        enableAutomaticScroll={Platform.OS === 'ios'}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Book a Service</Text>

          <View style={styles.inputGroup}>
            {/* Full Name */}
            <Text style={styles.label}>Full Name<Text style={{ color: 'red' }}>*</Text></Text>
            <TextInput
              placeholder="Enter your Full Name"
              value={name}
              onChangeText={setName}
              onFocus={() => setActiveInput('name')}
              onBlur={() => setActiveInput(null)}
              style={[
                styles.input,
                activeInput === 'name' && styles.inputActive
              ]}
              placeholderTextColor={'#4B4B4B'}
            />
            

            {/* Phone Number */}
            <Text style={styles.label}>Phone Number<Text style={{ color: 'red' }}>*</Text></Text>
            <View style={styles.phoneContainer}>
              <Image source={countryLogo} style={styles.icon} resizeMode="contain" />
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
                    formatted =
                      cleaned.slice(0, 3) +
                      ' ' +
                      cleaned.slice(3, 6) +
                      ' ' +
                      cleaned.slice(6);
                  }
                  setNumber(formatted);
                }}
                keyboardType="number-pad"
                style={[
                  styles.phoneInput,
                  activeInput === 'phone' && styles.inputActive
                ]}
                placeholderTextColor={'#4B4B4B'}
              />
            </View>

            {/* Select Service */}
            <Text style={styles.label}>Select Service<Text style={{ color: 'red' }}>*</Text></Text>
            <Dropdown
              options={services}
              placeholder="Select Services"
              placeholderColor="#4B4B4B"
              onSelectOption={setSelectedService}
              onOpen={() => setActiveInput('service')}
              onClose={() => setActiveInput(null)}
            />

            {/* Choose Date */}
            <Text style={styles.label}>Choose Date<Text style={{ color: 'red' }}>*</Text></Text>
            <View style={{ marginBottom: height * 0.025 }}>
              <TouchableOpacity 
                onPress={() => {
                  setShow(true);
                  setActiveInput('date');
                }} 
                style={[
                  styles.datePicker,
                  activeInput === 'date' && styles.inputActive
                ]}
              >
                <Text style={[styles.datePickerText, { fontSize: width * 0.035 }]}>
                  {date ? date.toDateString() : 'Pick a Date'}
                </Text>
                <Image 
                  source={CalenderIcon} 
                  style={[
                    { height: 21, width: 21 },
                    activeInput === 'date' && { tintColor: '#2F6BFF' }
                  ]} 
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
                    // Reset styling focus outline when picker resolves on Android
                    if (Platform.OS === 'android') {
                      setActiveInput(null);
                    }
                    if (event.type === 'set' && selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Preferred Time */}
            <Text style={styles.label}>Preferred Time<Text style={{ color: 'red' }}>*</Text></Text>
            <Dropdown
              options={shifts}
              placeholder="Choose a Shift"
              placeholderColor="#4B4B4B"
              onSelectOption={setSelectedShift}
              dropdownType="shift"
              onOpen={() => setActiveInput('shift')}
              onClose={() => setActiveInput(null)}
            />

            {/* Your Location */}
            <Text style={styles.label}>Your Location<Text style={{ color: 'red' }}>*</Text></Text>
            <Dropdown
              options={area}
              placeholder="Select your location"
              placeholderColor="#4B4B4B"
              onSelectOption={setSelectedArea}
              onOpen={() => setActiveInput('location')}
              onClose={() => setActiveInput(null)}
            />

            {/* Priority */}
            <Text style={styles.label}>Priority<Text style={{ color: 'red' }}>*</Text></Text>
            <Dropdown
              options={priority}
              placeholder="Select Priority"
              placeholderColor="#4B4B4B"
              onSelectOption={setSelectedPriority}
              value={selectedPriority}
              onOpen={() => setActiveInput('priority')}
              onClose={() => setActiveInput(null)}
            />

            {/* Select Budget */}
            <Text style={styles.label}>Select Budget<Text style={{ color: 'red' }}>*</Text></Text>
            <Dropdown
              value={selectedBudget}
              options={budget}
              placeholder="Select Budget"
              placeholderColor="#4B4B4B"
              onSelectOption={setSelectedBudget}
              onOpen={() => setActiveInput('budget')}
              onClose={() => setActiveInput(null)}
            />

            {/* Message */}
            <Text style={styles.label}>Message<Text style={{ color: 'red' }}>*</Text></Text>
            <TextArea
              value={message}
              onChangeText={setMessage}
              placeholder=""
              placeholderTextColor="#4B4B4B"
              maxHeight={160}
              borderColor="#3CB371"
              // Pass layout handlers down to custom textareas if built to handle them
              onFocus={() => setActiveInput('message')}
              onBlur={() => setActiveInput(null)}
              style={activeInput === 'message' && styles.inputActive}
            />

            {/* Submit Button */}
            <View style={styles.buttonPadding}>
              <Button
                style={styles.button1}
                textStyle={{ color: 'white', textAlign: 'center' }}
                onPress={handleSubmit}
              >
                SUBMIT
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'teal',
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    backgroundColor: 'teal',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: 'white',
    paddingLeft: 8,
    marginBottom: 10,
  },
  inputGroup: {
    marginTop: height * 0.015,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 10,
    marginBottom: height * 0.05,
  },
  input: {
    borderWidth: 1.5, // Match premium look thickness
    borderRadius: 12,
    paddingHorizontal: width * 0.035,
    height: height * 0.055, // Matches the height optimization from before
    marginBottom: height * 0.02,
    fontSize: width * 0.035,
    fontWeight: '500',
    borderColor: '#E2E8F0', // Cleaner neutral baseline gray
    color: '#1A1A1A',
    backgroundColor: '#fff',
  },
  inputActive: {
  borderColor: 'hsl(142, 71%, 45%)',      // Premium blue border glow
    backgroundColor: '#F4F7FF',  // Premium soft blue internal background tint
  },
  phoneContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  icon: {
    width: wp('7%'),
    height: hp('3%'),
    position: 'absolute',
    left: 10,
    zIndex: 2,
  },
  phoneInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: '#E2E8F0',
    height: height * 0.055,
    paddingLeft: wp('12%'),
    paddingRight: 10,
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#1A1A1A',
    backgroundColor: '#fff',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: width * 0.035,
    height: height * 0.055,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#4a4a4a',
  },
  label: {
    marginBottom: 6,
    paddingLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  buttonPadding: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  button1: {
    width: width * 0.4,
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  text: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});
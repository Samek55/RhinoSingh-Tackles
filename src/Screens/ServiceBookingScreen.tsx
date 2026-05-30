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
  KeyboardAvoidingView,
} from 'react-native';
import Dropdown from '../../src/components/Dropdown';
import { area, services, shifts, budget, priority } from '../../src/data/Data';
import TextArea from '../components/TextArea';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import countryLogo from '../assets/image/header/right.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { sendOtp } from '../api/otp';

const { width, height } = Dimensions.get('window');

const Button = ({ children, style, textStyle, onPress }: any) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={['#047857', '#15803d', '#65a30d']} // emerald gradient
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

const ServiceBookingScreen = ({ navigation }: { navigation: any }) => {
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
  const [dateText, setDateText] = useState('');

  const handleSubmit = async() => {
    const cleanNumber = number.replace(/\s/g, ''); // remove spaces

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

    if (!message.trim()) {
      Alert.alert('Validation Error', 'Message cannot be empty');
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

    try {
      // convert to E.164 format (IMPORTANT for Twilio)
      const formattedPhone = '+977' + cleanNumber;

      const res = await sendOtp(formattedPhone);

      if (!res?.success) {
        Alert.alert('Error', 'Failed to send OTP');
        return;
      }

      navigation.navigate('AdminOtp', {
        name: name.trim(),
        number: cleanNumber,
        selectedService,
        selectedShift,
        selectedArea,
        selectedPriority,
        selectedBudget,
        message: message.trim(),
        date: date.toISOString(),
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}

    >
      <View style={{ flex: 1 }}>
        <Header />
        <KeyboardAwareScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          // extraScrollHeight={80}
          keyboardOpeningTime={0}
          enableAutomaticScroll={true}
        >

          <View style={styles.formContainer}>
            <Text style={styles.title}>Book a Service</Text>


            <View
              style={[
                styles.inputGroup,
                { marginBottom: height * 0.08 },
              ]}
            >

              <Text style={styles.label}>Full Name<Text style={{ color: 'red' }}>*</Text></Text>
              <TextInput
                placeholder="Enter your Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor={'#4B4B4B'}
              />

              <Text style={styles.label}>Phone Number<Text style={{ color: 'red' }}>*</Text></Text>
              <View style={styles.phoneContainer}>
                <Image
                  source={countryLogo}
                  style={styles.icon}
                  resizeMode="contain"
                />

                <TextInput
                  placeholder="Enter your Phone Number"
                  value={number}
                  onChangeText={(value) => {
                    // keep only numbers
                    let cleaned = value.replace(/[^0-9]/g, '');

                    // limit to 10 digits
                    cleaned = cleaned.slice(0, 10);

                    // format 3-3-4
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
                  style={styles.phoneInput}
                  placeholderTextColor={'#4B4B4B'}
                />
              </View>

              <Text style={styles.label}>Select Service<Text style={{ color: 'red' }}>*</Text></Text>
              <Dropdown
                options={services}
                placeholder="Select Services"
                placeholderColor="#4B4B4B"
                onSelectOption={setSelectedService}
                borderColor='#3CB371'
              />

              <Text style={styles.label}>Choose Date<Text style={{ color: 'red' }}>*</Text></Text>
              <TextInput
                placeholder="Enter Date (YYYY-MM-DD)"
                value={dateText}
                onChangeText={(text) => {
                  setDateText(text);
                  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
                    const parsed = new Date(text);
                    if (!isNaN(parsed.getTime())) setDate(parsed);
                  } else {
                    setDate(null);
                  }
                }}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
                placeholderTextColor="#4B4B4B"
                maxLength={10}
              />

              <Text style={styles.label}>Preferred Time<Text style={{ color: 'red' }}>*</Text></Text>
              <Dropdown
                options={shifts}
                placeholder="Choose a Shift"
                placeholderColor="#4B4B4B"
                onSelectOption={setSelectedShift}
                dropdownType="shift"
                borderColor='#3CB371'
              />


              <Text style={styles.label}>Your Location<Text style={{ color: 'red' }}>*</Text></Text>
              <Dropdown
                options={area}
                placeholder="Select your location"
                placeholderColor="#4B4B4B"
                onSelectOption={setSelectedArea}
                borderColor='#3CB371'

              />


              <Text style={styles.label}>Priority<Text style={{ color: 'red' }}>*</Text></Text>
              <Dropdown
                options={priority}
                placeholder="Select Priority"
                placeholderColor="#4B4B4B"
                onSelectOption={setSelectedPriority}
                value={selectedPriority}
                borderColor='#3CB371'
              />
              <Text style={styles.label}>Select Budget<Text style={{ color: 'red' }}>*</Text></Text>
              <Dropdown
                value={selectedBudget}
                options={budget}
                placeholder="Select Budget"
                placeholderColor="#4B4B4B"
                onSelectOption={setSelectedBudget}
                borderColor='#3CB371'

              />

              <TextArea
                value={message}
                onChangeText={setMessage}
                placeholder=""
                placeholderTextColor="#4B4B4B"
                maxHeight={160}
                borderColor="#3CB371"
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
      </View >
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'teal',
    flexGrow: 1, // Ensures the container expands to take full height
  },
  formContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    backgroundColor: 'teal',

  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '700',
    marginBottom: height * 0.001,
    paddingTop: 2,
    paddingBottom: 3,
    color: 'white',
    paddingLeft: 8,
  },
  inputGroup: {
    marginTop: height * 0.015,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    maxHeight: '90%',
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    height: height * 0.05,
    marginBottom: height * 0.02,
    fontSize: width * 0.035,
    fontWeight: '500',
    borderColor: '#3CB371',
    textAlignVertical: 'center',
    paddingBottom: 10,
    color: '#4B4B4B',

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
    left: 8,
    zIndex: 2,
  },

  phoneInput: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#3CB371',

    height: height * 0.05,

    paddingLeft: wp('10.5%'), //  important for icon space
    paddingRight: 10,

    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#4B4B4B',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3CB371',
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    height: height * 0.05,
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#4B4B4B',
  },
  label: {
    marginBottom: 5,
    paddingLeft: 4,
    fontSize: 15,
    fontWeight: '500',

  },
  buttonPadding: {
    paddingBottom: 30,
    alignItems: 'center',
    color: '#fff',
  },
  button1: {
    width: width * 0.4,
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 30,
  },
  text: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});

export default ServiceBookingScreen;

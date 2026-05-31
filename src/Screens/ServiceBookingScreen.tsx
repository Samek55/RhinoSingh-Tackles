import React, { useState } from 'react';
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
  Modal,
  ScrollView,
} from 'react-native';

import Dropdown from '../../src/components/Dropdown';
import { area, services, shifts, budget, priority } from '../../src/data/Data';
import TextArea from '../components/TextArea';
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
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const buildWeeks = () => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < getFirstDay(calYear, calMonth); i++) cells.push(null);
    for (let d = 1; d <= getDaysInMonth(calYear, calMonth); d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  };

  const selectDay = (day: number) => {
    setDate(new Date(calYear, calMonth, day));
    setShowCalendar(false);
  };

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

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
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowCalendar(true)}>
                <Text style={date ? styles.dateText : styles.datePlaceholder}>
                  {date ? formatDate(date) : 'Select a date'}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>

              <Modal transparent animationType="fade" visible={showCalendar}>
                <View style={styles.calOverlay}>
                  <View style={styles.calCard}>
                    {/* Month / Year header */}
                    <View style={styles.calHeader}>
                      <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                        <Text style={styles.navArrow}>‹</Text>
                      </TouchableOpacity>
                      <Text style={styles.calMonthYear}>{MONTHS[calMonth]} {calYear}</Text>
                      <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                        <Text style={styles.navArrow}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Day-name row */}
                    <View style={styles.dayNamesRow}>
                      {DAY_NAMES.map(d => (
                        <Text key={d} style={styles.dayName}>{d}</Text>
                      ))}
                    </View>

                    {/* Calendar grid */}
                    {buildWeeks().map((week, wi) => (
                      <View key={wi} style={styles.weekRow}>
                        {week.map((day, di) => {
                          if (!day) return <View key={di} style={styles.dayCell} />;
                          const cellDate = new Date(calYear, calMonth, day);
                          const disabled = cellDate < today;
                          const selected = !!date &&
                            date.getDate() === day &&
                            date.getMonth() === calMonth &&
                            date.getFullYear() === calYear;
                          return (
                            <TouchableOpacity
                              key={di}
                              style={[styles.dayCell, selected && styles.selectedDay, disabled && styles.disabledDay]}
                              onPress={() => !disabled && selectDay(day)}
                              disabled={disabled}
                            >
                              <Text style={[styles.dayText, selected && styles.selectedDayText, disabled && styles.disabledDayText]}>
                                {day}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}

                    <TouchableOpacity style={styles.calCancelBtn} onPress={() => setShowCalendar(false)}>
                      <Text style={styles.calCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

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

        </ScrollView>
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3CB371',
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    height: height * 0.05,
    marginBottom: height * 0.02,
  },
  dateText: {
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#4B4B4B',
  },
  datePlaceholder: {
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#4B4B4B',
  },
  calendarIcon: {
    fontSize: 18,
  },
  calOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  calCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 26,
    fontWeight: '700',
    color: '#047857',
  },
  calMonthYear: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 4,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    margin: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  selectedDay: {
    backgroundColor: '#047857',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#9CA3AF',
  },
  calCancelBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  calCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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

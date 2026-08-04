import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import Dropdown from '../../components/bookings/Dropdown';
import { businessType, city, howduhear, partnershipInterest, services } from '../../src/data/Data';
import TextArea from '../../components/bookings/TextArea';
import SubmitOverlay from '../../components/bookings/SubmitOverlay';
import { useCountry } from '@/src/context/countryContext';
import { formatPhoneInput } from '@/src/constants/countryData';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FileUploadBox from '../../components/bookings/FileUploadBox';
import ClearFormIcon from '../../assets/icons/booking/clear.png'
import DropdownAdd from '../../components/bookings/DropdownAdd';
import { notifyAdmins } from '@/api/notifications';
import Header3 from '@/components/Header3drawer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createPartnershipSupabase } from '@/api/supabase/createPartnershipSupabase';
import { uploadImageToSupabasePartnership } from '@/src/utils/uploadImageToSBPartnership';

const { width, height } = Dimensions.get('window');

interface ButtonProps {
  children: React.ReactNode;
  style?: any;
  textStyle?: any;
  onPress: () => void;
}

const Button = ({ children, style, textStyle, onPress }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={style}
    >
      <Text style={[styles.text, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export type FileItem = {
  uri: string;
  fileName?: string;
};

export default function PartnershipScreen() {
  const scrollRef = useRef<any>(null);
  const { country, countryInfo } = useCountry();

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState('');

  // Photos state
  const [selectCompanyPhotos, setSelectCompanyPhotos] = useState<FileItem[]>([]);
  const [selectCRCphotos, setSelectCRCphotos] = useState<FileItem[]>([]);

  // Dropdown states
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [selectedPartnership, setSelectedPartnership] = useState('');
  const [selectedHowHeard, setSelectedHowHeard] = useState('Facebook ');
  const [selectedServicesOffered, setSelectedServicesOffered] = useState<string[]>([]);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<'loading' | 'success'>('loading');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const clearAllFields = () => {
    setName('');
    setNumber('');
    setEmail('');
    setOrganizationName('');
    setMessage('');
    setEmployees('');
    setSelectCompanyPhotos([]);
    setSelectCRCphotos([]);
    setSelectedArea('');
    setSelectedBusinessType('');
    setSelectedPartnership('');
    setSelectedHowHeard('Facebook ');
    setSelectedServicesOffered([]);
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

    if (!name.trim()) return Alert.alert('Validation Error', 'Full Name is required');
    if (!cleanNumber || cleanNumber.length !== 10) return Alert.alert('Validation Error', 'Enter a valid 10-digit phone number');
    if (!email.trim()) return Alert.alert('Validation Error', 'Email is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return Alert.alert('Validation Error', 'Enter a valid email address');
    if (!organizationName.trim()) return Alert.alert('Validation Error', 'Organization name is required');
    if (!employees.trim()) return Alert.alert('Validation Error', 'Number of employees is required');
    if (!selectedArea.trim()) return Alert.alert('Validation Error', 'Please select area');
    if (!selectedBusinessType.trim()) return Alert.alert('Validation Error', 'Please select business type');
    if (!selectedPartnership.trim()) return Alert.alert('Validation Error', 'Please select partnership type');
    if (!selectedHowHeard.trim()) return Alert.alert('Validation Error', 'Please select how you heard about us');
    if (selectedServicesOffered.length === 0) return Alert.alert('Validation Error', 'Please select at least one service');
    if (selectCompanyPhotos.length === 0) return Alert.alert('Validation Error', 'Please upload company photos');
    if (selectCRCphotos.length === 0) return Alert.alert('Validation Error', 'Please upload CRC photos');
    if (!message.trim()) return Alert.alert('Validation Error', 'Message cannot be empty');

    setOverlayStatus('loading');
    setOverlayVisible(true);

    try {
      const [companyImages, crcImages] = await Promise.all([
        Promise.all(selectCompanyPhotos.map((item) => uploadImageToSupabasePartnership(item, "company"))),
        Promise.all(selectCRCphotos.map((item) => uploadImageToSupabasePartnership(item, "crc"))),
      ]);

      const partnership = {
        full_name: name,
        name_of_organisation: organizationName,
        phone_number: cleanNumber,
        email: email.trim(),
        city: selectedArea,
        number_of_employees: Number(employees),
        business_type: selectedBusinessType,
        services_offered: selectedServicesOffered,
        partnership_interests: selectedPartnership,
        how_did_you_hear_about_us: selectedHowHeard,
        message: message.trim(),
        company_photos: companyImages,
        company_registration_certificates: crcImages,
      };

      await createPartnershipSupabase(partnership);
      notifyAdmins(name.trim()).catch(() => { });
      setOverlayStatus('success');
    } catch (error) {
      setOverlayVisible(false);
      Alert.alert('Error', 'Submission failed. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header3 />
      <SubmitOverlay
        visible={overlayVisible}
        status={overlayStatus}
        onClear={() => { clearAllFields(); setOverlayVisible(false); }}
        onClose={() => setOverlayVisible(false)}
      />
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={Platform.OS === 'ios'}
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.formContainer, { marginBottom: hp('5%') }]}>
          <Text style={styles.title}>Become a Partner</Text>
          <Text style={styles.subTitle}>Partnership opportunity with RocketSingh</Text>

          <View style={styles.spacerGap} />

          {/* Full Name */}
          <Text style={styles.label}>Full Name<Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            placeholder="Enter your Full Name"
            value={name}
            onChangeText={setName}
            onFocus={() => setActiveInput('name')}
            onBlur={() => setActiveInput(null)}
            style={[styles.input, activeInput === 'name' && styles.inputActive]}
            placeholderTextColor={'#4B4B4B'}
            maxLength={30}
          />

          {/* Name of Organization */}
          <Text style={styles.label}>Name of Organization<Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            placeholder="Enter the name of your Organization"
            value={organizationName}
            onChangeText={setOrganizationName}
            onFocus={() => setActiveInput('organization')}
            onBlur={() => setActiveInput(null)}
            style={[styles.input, activeInput === 'organization' && styles.inputActive]}
            placeholderTextColor={'#4B4B4B'}
            maxLength={100}

          />

          {/* Phone Number */}
          <Text style={styles.label}>Phone Number<Text style={{ color: 'red' }}>*</Text></Text>
          <View style={styles.phoneContainer}>
            <View style={styles.icon}>
              <Text style={styles.flagEmoji}>{countryInfo.flag}</Text>
            </View>
            <TextInput
              placeholder="Enter your Phone Number"
              value={number}
              onFocus={() => setActiveInput('phone')}
              onBlur={() => setActiveInput(null)}
              onChangeText={(value) => {
                const cleaned = value.replace(/[^0-9]/g, '').slice(0, 10);
                setNumber(formatPhoneInput(cleaned, country));
              }}
              keyboardType="number-pad"
              style={[styles.phoneInput, activeInput === 'phone' && styles.inputActive]}
              placeholderTextColor={'#4B4B4B'}
              maxLength={12}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email<Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            placeholder="Enter your Email Address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setActiveInput('email')}
            onBlur={() => setActiveInput(null)}
            style={[styles.input, activeInput === 'email' && styles.inputActive]}
            placeholderTextColor={'#4B4B4B'}
          />

          {/* Company Photos */}
          <Text style={styles.label}>Company Photos<Text style={{ color: 'red' }}>*</Text></Text>
          <FileUploadBox value={selectCompanyPhotos} maxFiles={5} onChange={setSelectCompanyPhotos} />

          {/* Area Dropdown */}
          <Text style={styles.label}>City<Text style={{ color: 'red' }}>*</Text></Text>
          <Dropdown
            options={city}
            placeholder="Select your City"
            placeholderColor="#4B4B4B"
            onSelectOption={setSelectedArea}
            value={selectedArea}
            onOpen={() => setActiveInput('area')}
            onClose={() => setActiveInput(null)}
          />

          {/* Number of Employees */}
          <Text style={styles.label}>Number of Employees<Text style={{ color: 'red' }}>*</Text></Text>
          <TextInput
            placeholder="Enter the number of Employees"
            placeholderTextColor={'#4B4B4B'}
            keyboardType="numeric"
            value={employees}
            onFocus={() => setActiveInput('employees')}
            onBlur={() => setActiveInput(null)}
            onChangeText={(text) => setEmployees(text.replace(/[^0-9]/g, ''))}
            style={[styles.input, activeInput === 'employees' && styles.inputActive]}
            maxLength={7}
          />

          {/* Business Type Dropdown */}
          <Text style={styles.label}>Business Type<Text style={{ color: 'red' }}>*</Text></Text>
          <Dropdown
            options={businessType}
            placeholder="Select your Business Type"
            placeholderColor="#4B4B4B"
            onSelectOption={setSelectedBusinessType}
            value={selectedBusinessType}
            onOpen={() => setActiveInput('businessType')}
            onClose={() => setActiveInput(null)}
          />

          {/* Services Offered Dropdown Add */}
          <Text style={styles.label}>Services Offered<Text style={{ color: 'red' }}>*</Text></Text>
          <DropdownAdd
            options={services}
            placeholder="Select the Services you offer"
            placeholderColor="#4B4B4B"
            onSelectOption={setSelectedServicesOffered}
            value={selectedServicesOffered}
            onOpen={() => setActiveInput('servicesOffered')}
            onClose={() => setActiveInput(null)}
          />

          {/* Partnership Interest Dropdown */}
          <Text style={styles.label}>Partnership Interest<Text style={{ color: 'red' }}>*</Text></Text>
          <Dropdown
            options={partnershipInterest}
            placeholder="Select Partnership Interest"
            placeholderColor="#4B4B4B"
            onSelectOption={setSelectedPartnership}
            value={selectedPartnership}
            onOpen={() => setActiveInput('partnership')}
            onClose={() => setActiveInput(null)}
          />

          {/* Company Registration Certificates */}
          <Text style={styles.label}>Company Registration Certificates<Text style={{ color: 'red' }}>*</Text></Text>
          <FileUploadBox value={selectCRCphotos} maxFiles={10} onChange={setSelectCRCphotos} />

          {/* How did you hear about us Dropdown */}
          <Text style={styles.label}>How did you hear about us?<Text style={{ color: 'red' }}>*</Text></Text>
          <Dropdown
            options={howduhear}
            placeholder="How did you hear about us?"
            placeholderColor="#4B4B4B"
            onSelectOption={setSelectedHowHeard}
            value={selectedHowHeard}
            onOpen={() => setActiveInput('howHeard')}
            onClose={() => setActiveInput(null)}
          />

          {/* Message TextArea */}
          <Text style={styles.label}>Message<Text style={{ color: 'red' }}>*</Text></Text>
          <TextArea
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your message here"
            placeholderTextColor="#4B4B4B"
            maxHeight={160}
            onFocus={() => setActiveInput('message')}
            onBlur={() => setActiveInput(null)}
            style={[
              styles.textAreaBase,
              activeInput === 'message' ? styles.inputActive : styles.inputInactive
            ]}
          />

          {/* Form Actions */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.buttonClearFlex} onPress={handleClearForm}>
              <Image source={ClearFormIcon} style={styles.clearIcon} />
              <Text style={styles.buttonClear}>Clear form</Text>
            </Pressable>

            <Button
              style={styles.buttonSubmit}
              textStyle={{ color: 'white', textAlign: 'center' }}
              onPress={handleSubmit}
            >
              Submit
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
    backgroundColor: 'white',
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingLeft: 3,
  },
  subTitle: {
    fontSize: width * 0.034,
    fontWeight: '400',
    color: '#666',
    paddingLeft: 3,
    marginTop: 4,
  },
  spacerGap: {
    marginVertical: 20
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: width * 0.035,
    height: height * 0.055,
    marginBottom: height * 0.02,
    fontSize: width * 0.035,
    fontWeight: '500',
    borderColor: '#E2E8F0',
    color: '#1A1A1A',
    backgroundColor: '#fff',
  },
  textAreaBase: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: width * 0.035,
    paddingVertical: 10,
    fontSize: width * 0.035,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  inputInactive: {
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  inputActive: {
    borderColor: 'hsl(142, 71%, 45%)',
    backgroundColor: '#F4F7FF',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: wp('5%'),
  },
  clearIcon: {
    width: wp('6%'),
    height: hp('2.5%'),
    resizeMode: 'contain',
    marginRight: 4,
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
  label: {
    marginBottom: 6,
    paddingLeft: 4,
    fontSize: wp('3.6%'),
    fontWeight: '600',
    color: '#4A4A4A',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonSubmit: {
    width: width * 0.4,
    height: height * 0.058,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 40,
    backgroundColor: '#000',
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
  text: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});
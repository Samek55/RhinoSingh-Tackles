import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Dimensions,
    StyleSheet,
    Alert,
} from 'react-native';
import PhoneIcon from '../../../assets/header/right.png';
import EyeOffIcon from '../../../assets/icons/admin/eyeOff.png';
import EyeOnIcon from '../../../assets/icons/admin/eyeOn.png';

import CustomCheckbox from '../../../components/admin/CustomCheckbox';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import Header4 from '@/components/Header4Admin';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../../src/firebase/firebaseConfig";

// 🛢️ Realtime Database Core Hooks
import { getDatabase, ref, get } from "firebase/database";

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => {
    const guidelineBaseWidth = 375;
    return (size * width) / guidelineBaseWidth;
};

export default function AdminLogin() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [phoneNumber, setphoneNumber] = useState<string>('');

    // Using the 6-box input to construct our 6-digit PIN password
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleChange = (text: string, index: number) => {
        const cleanedText = text.replace(/[^0-9]/g, '');

        const newOtp = [...otp];
        newOtp[index] = cleanedText.slice(-1);
        setOtp(newOtp);

        // Moving FORWARD safely
        if (cleanedText && index < 5) {
            const nextInput = inputs.current[index + 1];
            if (nextInput && typeof nextInput.focus === 'function') {
                nextInput.focus();
            }
        }

        // Moving BACKWARD safely
        if (text === '' && index > 0) {
            const prevInput = inputs.current[index - 1];
            if (prevInput && typeof prevInput.focus === 'function') {
                prevInput.focus();
            }
        }
    };

    const handleBackspace = (text: string, index: number) => {
        if (!text && index > 0) {
            const prevInput = inputs.current[index - 1];
            if (prevInput && typeof prevInput.focus === 'function') {
                prevInput.focus();
            }
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async () => {
        const pinPassword = otp.join(""); // Gather the 6-digit PIN here

        try {
            if (!phoneNumber || pinPassword.length < 6) {
                Alert.alert("Error", "Please enter phone and a valid 6-digit PIN");
                return;
            }

            const email = `${phoneNumber}@rocketsingh.app`;
            const userCredential = await signInWithEmailAndPassword(auth, email, pinPassword);
            const user = userCredential.user;

            if (user) {
                // 🔍 Fetch user record node from Firebase Realtime Database
                const db = getDatabase();
                const userSnapshot = await get(ref(db, `users/${user.uid}`));

                if (!userSnapshot.exists()) {
                    await signOut(auth);
                    Alert.alert("Access Denied", "No matching user profiles found in the local cloud directories.");
                    return;
                }

                const userData = userSnapshot.val();
                const userRole = userData?.role;

                // 🟩 SET FLAG TO TRUE SAFELY WITH SOLID NATIVE GUARD
                try {
                    const AsyncStorageModule = require('@react-native-async-storage/async-storage');
                    const AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;
                    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
                        await AsyncStorage.setItem('userProfileSetupCompleted', 'true');
                    }
                } catch (storageError) {
                    console.warn('Failed to save profile setup flag safely:', storageError);
                }

                // 🔥 Clean session link with safe Native module initialization check
                try {
                    const OneSignalModule = require('react-native-onesignal');
                    const OneSignal = OneSignalModule.OneSignal || OneSignalModule.default;
                    if (OneSignal && typeof OneSignal.login === 'function') {
                        OneSignal.login(user.uid);
                    }
                } catch (e) {
                    console.warn('OneSignal registration linkage bypassed safely:', e);
                }

                Alert.alert(
                    "Login Successful",
                    `Welcome back! Access level: ${userRole || 'User'}`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // 🔀 DYNAMIC SECURITY ROLE ROUTING MATRIX
                                if (userRole === "career") {
                                    router.push('/admin/BookingHistory');
                                } else if (userRole === "admin") {
                                    router.push('/admin/HelpboxHistory');
                                } else if (userRole === "superadmin") {
                                    router.push('/admin/ProfessionalHistory');
                                } else {
                                    Alert.alert("Error", "Unauthorized account categorization mapping configuration.");
                                }
                            }
                        }
                    ]
                );
            }

        } catch (error: any) {
            console.log("Login error:", error.message);
            Alert.alert("Error", "Invalid phone or PIN");
        }
    };

    return (
        <View style={{ flex: 1 }} >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Header4 />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                    <Text style={styles.title}>RocketSingh</Text>
                    <Text style={styles.subtitle}>Admin Login</Text>

                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Sign in</Text>

                        {/* Phone Number Input */}
                        <View style={styles.inputContainer}>
                            <Image source={PhoneIcon} style={{ width: 30, height: 30 }} />
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor={'rgba(67, 67, 67,0.4)'}
                                style={styles.textInput}
                                keyboardType="number-pad"
                                autoCapitalize="none"
                                value={phoneNumber}
                                onChangeText={(value) => {
                                    let cleaned = value.replace(/[^0-9]/g, '');
                                    cleaned = cleaned.slice(0, 10);
                                    setphoneNumber(cleaned);
                                }}
                                maxLength={10}
                            />
                        </View>

                        {/* Structured PIN & OTP Container */}
                        <View style={styles.otpSectionWrapper}>
                            {/* Top Section: Label & Eye Icon Switch */}
                            <View style={styles.otpHeaderRow}>
                                <Text style={styles.pinLabelText}>PIN</Text>
                                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeButton}>
                                    {passwordVisible ? (
                                        <Image source={EyeOnIcon} style={{ width: 23, height: 27, tintColor: 'hsl(0, 0%, 30%)' }} />
                                    ) : (
                                        <Image source={EyeOffIcon} style={{ width: 22, height: 22, tintColor: 'hsl(0, 0%, 30%)' }} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Middle Section: OTP Inputs */}
                            <View style={styles.otpBoxesContainer}>
                                {otp.map((value, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => {
                                            inputs.current[index] = ref;
                                        }}
                                        value={!passwordVisible && value ? '*' : value}
                                        onChangeText={(text) => handleChange(text, index)}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === "Backspace") {
                                                handleBackspace(value, index);
                                            }
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        style={styles.box}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.btnContainerFlex}>
                            <TouchableOpacity>
                                <CustomCheckbox />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text style={styles.btnText}>Forgot PIN?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>

                        <View style={styles.loginDivider} />

                        <Text style={styles.btnTextBelow}>Become a member :{' '}
                            <Text style={{ fontWeight: '900', color: 'black' }}
                                onPress={() => router.push('/Career')}
                            >
                                Join Now
                            </Text>
                        </Text>

                        <View style={{ marginTop: 5, width: '100%', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity onPress={() => router.push('/ProfessionalCreate')}>
                                <Text style={styles.btnTextBelow}>Create Account</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 0
    },
    title: {
        fontSize: scaleFont(26),
        fontWeight: '900',
        marginTop: hp('10%'),
        width: '100%',
        color: 'green',
        paddingLeft: hp('3%')
    },
    subtitle: {
        width: '100%',
        fontSize: hp('2%'),
        paddingLeft: hp('3%'),
        fontWeight: '500',
        color: 'hsl(0, 0%, 20%)',
        marginBottom: hp('5%')
    },
    btnContainerFlex: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: hp('1%'),
        marginTop: 15
    },
    btnText: {
        color: '#333',
        fontWeight: '500',
        fontSize: hp('1.5%'),
        marginBottom: hp('0.3%')
    },
    btnTextBelow: {
        color: '#333',
        fontWeight: '500',
        fontSize: hp('1.5%'),
    },
    formContainer: {
        paddingHorizontal: '10%',
        width: '100%',
        alignItems: 'center',
        paddingVertical: hp('3%'),
        backgroundColor: '#ebffef',
        paddingBottom: hp('30%'),
        marginTop: hp('5%'),
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderColor: 'rgba(0, 0, 0,0.1)',
        borderWidth: 1
    },
    welcomeText: {
        fontSize: scaleFont(22),
        fontWeight: '900',
        marginTop: height * 0.01,
        marginBottom: height * 0.04,
        width: '100%',
        color: 'green',
        paddingHorizontal: hp('1.3%')
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderWidth: 1,
        width: '100%',
        marginBottom: '5%',
        borderRadius: 12,
        borderColor: 'rgba(0, 0, 0,0.1)',
        alignItems: 'center',
        height: hp('6%'),
        backgroundColor: '#fff'
    },
    textInput: {
        fontSize: scaleFont(17),
        fontWeight: '600',
        flex: 1,
        paddingHorizontal: hp('2%'),
        letterSpacing: 0.5
    },
    otpSectionWrapper: {
        width: '100%',
        marginBottom: 10,
    },
    otpHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: hp('1%'),
        marginBottom: 8,
    },
    pinLabelText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: '#333',
    },
    otpBoxesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
    },
    box: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0,0.1)",
        textAlign: "center",
        fontSize: 18,
        borderRadius: 8,
        backgroundColor: '#fff'
    },
    eyeButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginButton: {
        marginTop: height * 0.04,
        height: height * 0.06,
        width: '95%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green'
    },
    loginButtonText: {
        fontSize: scaleFont(13),
        fontWeight: '600',
        color: '#fff',
    },
    loginDivider: {
        borderWidth: 0.5,
        width: '100%',
        borderColor: 'rgba(0,0,0,0.2)',
        marginBottom: hp('3%'),
        marginTop: hp('4%')
    },
});
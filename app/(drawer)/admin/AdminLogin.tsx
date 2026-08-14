import React, { useRef, useState } from 'react';
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
    DeviceEventEmitter,
} from 'react-native';
import EyeOffIcon from '../../../assets/icons/admin/eyeOff.png';
import EyeOnIcon from '../../../assets/icons/admin/eyeOn.png';
import AdminIcon from '../../../assets/icons/admin/admin2.png';

import CustomCheckbox from '../../../components/admin/CustomCheckbox';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import Header4 from '@/components/Header4Admin';
import { adminLogin } from '@/api/supabase/adminAuth';
import { supabase } from '@/src/lib/supabase';
import { sanitizeTagKey } from "@/api/notifications";
import { useCountry } from '@/src/context/countryContext';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => {
    const guidelineBaseWidth = 375;
    return (size * width) / guidelineBaseWidth;
};

export default function AdminLogin() {
    const { countryInfo } = useCountry();
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

        if (!phoneNumber || pinPassword.length < 6) {
            Alert.alert("Error", "Please enter phone and a valid 6-digit PIN");
            return;
        }

        try {
            const result = await adminLogin(phoneNumber, pinPassword);

            if (!result.success) {
                if (result.status === 'Pending') {
                    Alert.alert("Approval Pending", "Your account is awaiting superadmin approval.");
                } else if (result.status === 'Rejected') {
                    Alert.alert("Access Denied", "Your account application was not approved.");
                } else if (result.status === 'Inactive') {
                    Alert.alert("Account Disabled", "Your account has been deactivated. Contact a superadmin.");
                } else {
                    Alert.alert("Login Failed", result.message || "Invalid phone or PIN");
                }
                return;
            }

            const userRole = result.role;

            // 🔥 Clean session link with safe Native module initialization check
            try {
                const OneSignalModule = require('react-native-onesignal');
                const OneSignal = OneSignalModule.OneSignal || OneSignalModule.default;
                if (OneSignal && typeof OneSignal.login === 'function') {
                    OneSignal.login(phoneNumber);
                    // Cold starts reset this tag to '' (see app/_layout.tsx), and account
                    // creation only sets it once at signup time — without re-setting it here
                    // on every login, admins/professionals stop receiving role-targeted
                    // pushes (new bookings, helpbox requests) after their first session.
                    if (userRole && OneSignal.User?.addTag) {
                        OneSignal.User.addTag('role', userRole);
                    }

                    // Career accounts only get job-alert pushes for services/areas they
                    // actually cover — rebuilt from their workforce application on every
                    // login so it stays correct even if their profile is edited later.
                    // (The old Firebase flow read these off the users/{uid} node, which
                    // this table has no equivalent of — workforce is the real source.)
                    if (userRole === 'career' && OneSignal.User?.addTags) {
                        const { data: workforceRow } = await supabase
                            .from('workforce')
                            .select('area_of_expertise, preferred_working_area')
                            .eq('phone', phoneNumber)
                            .maybeSingle();

                        const tags: Record<string, string> = {};
                        const services: string[] = Array.isArray(workforceRow?.area_of_expertise) ? workforceRow.area_of_expertise : [];
                        const areas: string[] = Array.isArray(workforceRow?.preferred_working_area) ? workforceRow.preferred_working_area : [];
                        services.filter(Boolean).forEach((s) => { tags[`service_${sanitizeTagKey(s)}`] = 'true'; });
                        areas.filter(Boolean).forEach((a) => { tags[`area_${sanitizeTagKey(a)}`] = 'true'; });
                        if (Object.keys(tags).length > 0) {
                            OneSignal.User.addTags(tags);
                        }
                    }
                }
            } catch (e) {
                console.warn('OneSignal registration linkage bypassed safely:', e);
            }

            // Tells app/_layout.tsx and CustomDrawer.tsx to re-read the new session
            // state — there's no live AsyncStorage listener like Firebase's
            // onAuthStateChanged, so this is the equivalent signal.
            DeviceEventEmitter.emit('authChanged');

            // 1. Determine the message based on the role
            const roleLabels: { [key: string]: string } = {
                career: "🚀 Welcome back, Professional! Let's get to work.",
                admin: "🛡️ Welcome, Admin! System dashboard ready.",
                superadmin: "👑 Welcome, SuperAdmin! Orchestration mode enabled."
            };

            const welcomeMessage = roleLabels[userRole || ''] || "Welcome back!";

            Alert.alert(
                "Login Successful",
                welcomeMessage,
                [
                    {
                        text: "Let's Go",
                        onPress: () => {
                            // 🔀 DYNAMIC SECURITY ROLE ROUTING MATRIX
                            if (userRole === "career") {
                                router.push('/admin/BookingHistory');
                            } else if (userRole === "admin") {
                                router.push('/admin/HelpboxHistory');
                            } else if (userRole === "superadmin") {
                                router.push('/admin/ProfessionalHistory');
                            }
                        }
                    }
                ]
            );

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

                    <View style={styles.titleContainer}>
                        <Image source={AdminIcon} style={styles.adminIcon} />
                        <Text style={styles.title}>RocketSingh</Text>
                        <Text style={styles.subtitle}>Admin Login</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Sign In</Text>

                        {/* Phone Number Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.flagEmoji}>{countryInfo.flag}</Text>
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor={'rgba(108, 117, 125, 0.6)'}
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
                                <Text style={styles.pinLabelText}>Security PIN</Text>
                                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeButton}>
                                    {passwordVisible ? (
                                        <Image source={EyeOnIcon} style={styles.eyeIcon} />
                                    ) : (
                                        <Image source={EyeOffIcon} style={styles.eyeIcon} />
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
                            <TouchableOpacity onPress={() => router.push('/admin/AdminForgotPin' as any)}>
                                <Text style={styles.btnText}>Forgot PIN?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>

                        <View style={styles.loginDivider} />

                        <Text style={styles.btnTextBelow}>Become a member :{' '}
                            <Text style={styles.joinNowText}
                                onPress={() => router.push('/Career')}
                            >
                                Join Now
                            </Text>
                        </Text>

                        <View style={styles.createAccountContainer}>
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
        backgroundColor: '#064E3B',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 0
    },
    titleContainer: {
        alignItems: 'center',
        padding: 20,
        marginTop: 10,
    },
    adminIcon: {
        width: 85,
        height: 85,
        marginBottom: 15,
        borderRadius: 42.5,
        backgroundColor: '#ffffff',
        padding: 20,
        tintColor: '#064E3B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: scaleFont(28),
        fontWeight: '900',
        width: '100%',
        color: '#ffffff',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        width: '100%',
        fontSize: hp('2%'),
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 3,
        marginTop: 2,
    },
    btnContainerFlex: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: hp('1%'),
        marginTop: 15
    },
    btnText: {
        color: '#6c757d',
        fontWeight: '600',
        fontSize: hp('1.5%'),
        marginBottom: hp('0.3%')
    },
    btnTextBelow: {
        color: '#6c757d',
        fontWeight: '500',
        fontSize: hp('1.5%'),
    },
    joinNowText: {
        fontWeight: '900',
        color: '#064E3B',
    },
    formContainer: {
        paddingHorizontal: '7%',
        width: '100%',
        alignItems: 'center',
        paddingVertical: hp('3%'),
        backgroundColor: '#F5F9F8',
        paddingBottom: hp('30%'),
        marginTop: hp('1.5%'),
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderColor: 'rgba(0, 0, 0,0.05)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 10,
    },
    welcomeText: {
        fontSize: scaleFont(24),
        fontWeight: '800',
        marginTop: height * 0.04,
        marginBottom: height * 0.02,
        width: '100%',
        color: '#1a1a2e',
        paddingHorizontal: hp('1.3%'),
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderWidth: 2,
        width: '100%',
        marginBottom: '5%',
        borderRadius: 14,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        alignItems: 'center',
        height: hp('6.5%'),
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    flagEmoji: {
        fontSize: 22,
    },
    textInput: {
        fontSize: scaleFont(17),
        fontWeight: '600',
        flex: 1,
        paddingHorizontal: hp('2%'),
        letterSpacing: 0.5,
        color: '#1a1a2e',
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
        color: '#1a1a2e',
        letterSpacing: 1,
    },
    otpBoxesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
    },
    box: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        textAlign: "center",
        fontSize: 20,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        color: '#064E3B',
        fontWeight: '700',
        // Added shadow to PIN boxes to make them "pop"
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    eyeButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    eyeIcon: {
        width: 23,
        height: 27,
        tintColor: '#6c757d',
    },
    loginButton: {
        marginTop: height * 0.04,
        height: height * 0.06,
        width: '95%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#064E3B',
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonText: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1.5,
    },
    loginDivider: {
        borderWidth: 0.5,
        width: '100%',
        borderColor: 'rgba(0,0,0,0.08)',
        marginBottom: hp('3%'),
        marginTop: hp('4%')
    },
    createAccountContainer: {
        marginTop: 5,
        width: '100%',
        alignItems: 'center',
        gap: 10
    },
});

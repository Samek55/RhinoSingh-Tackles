import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import HeaderProfessional from '@/components/HeaderProfessional';
import { requestPinReset, confirmPinReset } from '@/api/supabase/professionalAuth';
import { useRequireNepal } from '@/hooks/useRequireNepal';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

type Stage = 'phone' | 'verify';
const RESEND_COOLDOWN_SECONDS = 30;

export default function ProfessionalPinReset() {
    const isNepal = useRequireNepal();
    const [stage, setStage] = useState<Stage>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPin, setNewPin] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // The 'verify' stage previously had no way out short of the OS back
    // gesture if the code expired or attempts ran out — no resend, no way to
    // re-enter a different phone number.
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleRequestCode = async () => {
        if (phoneNumber.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }
        setSubmitting(true);
        try {
            const result = await requestPinReset(phoneNumber);
            if (result.ok) {
                setStage('verify');
                setResendCooldown(RESEND_COOLDOWN_SECONDS);
            } else {
                Alert.alert('Error', 'Could not send the verification code. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0 || submitting) return;
        setSubmitting(true);
        try {
            const result = await requestPinReset(phoneNumber);
            if (result.ok) {
                setOtpCode('');
                setResendCooldown(RESEND_COOLDOWN_SECONDS);
                Alert.alert('Code Sent', 'A new verification code has been sent.');
            } else {
                Alert.alert('Error', 'Could not resend the verification code. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePhone = () => {
        setStage('phone');
        setOtpCode('');
        setNewPin('');
        setResendCooldown(0);
    };

    const handleConfirm = async () => {
        if (otpCode.length < 4 || newPin.length !== 4) {
            Alert.alert('Error', 'Enter the code you received and a new 4-digit PIN');
            return;
        }
        setSubmitting(true);
        try {
            const result = await confirmPinReset(phoneNumber, otpCode, newPin);
            if (result.success) {
                Alert.alert('Success', 'Your PIN has been reset. Please log in.', [
                    { text: 'OK', onPress: () => router.replace('/professional/ProfessionalLogin' as any) },
                ]);
            } else {
                Alert.alert('Error', result.error || 'Could not reset your PIN');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!isNepal) return null;

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <HeaderProfessional subtitle="Reset PIN" />
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>
                        {stage === 'phone' ? (
                            <>
                                <Text style={styles.label}>Enter your registered phone number</Text>
                                <TextInput
                                    placeholder="Phone Number"
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    value={phoneNumber}
                                    onChangeText={(v) => setPhoneNumber(v.replace(/[^0-9]/g, '').slice(0, 10))}
                                    maxLength={10}
                                />
                                <TouchableOpacity
                                    style={[styles.button, submitting && { opacity: 0.7 }]}
                                    onPress={handleRequestCode}
                                    disabled={submitting}
                                >
                                    <Text style={styles.buttonText}>{submitting ? 'Sending...' : 'Send Code'}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Enter the code sent to your phone and your new PIN</Text>
                                <TextInput
                                    placeholder="Verification Code"
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    value={otpCode}
                                    onChangeText={(v) => setOtpCode(v.replace(/[^0-9]/g, '').slice(0, 8))}
                                />
                                <TextInput
                                    placeholder="New 4-digit PIN"
                                    style={styles.textInput}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    value={newPin}
                                    onChangeText={(v) => setNewPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
                                    maxLength={4}
                                />
                                <TouchableOpacity
                                    style={[styles.button, submitting && { opacity: 0.7 }]}
                                    onPress={handleConfirm}
                                    disabled={submitting}
                                >
                                    <Text style={styles.buttonText}>{submitting ? 'Resetting...' : 'Reset PIN'}</Text>
                                </TouchableOpacity>
                                <View style={styles.linkRow}>
                                    <TouchableOpacity onPress={handleResendCode} disabled={submitting || resendCooldown > 0}>
                                        <Text style={[styles.linkText, (submitting || resendCooldown > 0) && styles.linkTextDisabled]}>
                                            {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleChangePhone} disabled={submitting}>
                                        <Text style={styles.linkText}>Change Number</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#064E3B' },
    scrollContent: { flexGrow: 1, alignItems: 'center' },
    formContainer: {
        paddingHorizontal: '7%',
        width: '100%',
        alignItems: 'stretch',
        paddingVertical: hp('4%'),
        backgroundColor: '#F5F9F8',
        marginTop: hp('1.5%'),
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        minHeight: hp('75%'),
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: hp('2%'),
    },
    textInput: {
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: 14,
        height: hp('6.5%'),
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        color: '#1a1a2e',
        marginBottom: hp('2%'),
    },
    button: {
        height: hp('6%'),
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#064E3B',
        marginTop: hp('1%'),
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1.5,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp('2%'),
    },
    linkText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#064E3B',
    },
    linkTextDisabled: {
        color: '#9ca3af',
    },
});

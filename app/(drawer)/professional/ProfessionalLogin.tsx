import React, { useRef, useState } from 'react';
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
import { professionalLogin } from '@/api/supabase/professionalAuth';
import { useRequireNepal } from '@/hooks/useRequireNepal';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function ProfessionalLogin() {
    const isNepal = useRequireNepal();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [submitting, setSubmitting] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handlePinChange = (text: string, index: number) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        const next = [...pin];
        next[index] = cleaned.slice(-1);
        setPin(next);

        if (cleaned && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (text: string, index: number) => {
        if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        const pinValue = pin.join('');
        if (phoneNumber.length !== 10 || pinValue.length !== 4) {
            Alert.alert('Error', 'Please enter a valid phone number and 4-digit PIN');
            return;
        }

        setSubmitting(true);
        try {
            const result = await professionalLogin(phoneNumber, pinValue);
            if (result.success) {
                router.replace('/professional/MyLeads' as any);
            } else {
                Alert.alert('Login Failed', result.error || 'Invalid phone number or PIN');
            }
        } catch {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isNepal) return null;

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <HeaderProfessional subtitle="Professional Login" />
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Sign In</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.flagEmoji}>🇳🇵</Text>
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor="rgba(108, 117, 125, 0.6)"
                                style={styles.textInput}
                                keyboardType="number-pad"
                                value={phoneNumber}
                                onChangeText={(value) => setPhoneNumber(value.replace(/[^0-9]/g, '').slice(0, 10))}
                                maxLength={10}
                            />
                        </View>

                        <Text style={styles.pinLabelText}>4-digit PIN</Text>
                        <View style={styles.pinBoxesContainer}>
                            {pin.map((value, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputs.current[index] = ref; }}
                                    value={value}
                                    secureTextEntry
                                    onChangeText={(text) => handlePinChange(text, index)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace') handleBackspace(value, index);
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={styles.box}
                                />
                            ))}
                        </View>

                        <TouchableOpacity onPress={() => router.push('/professional/ProfessionalPinReset' as any)}>
                            <Text style={styles.forgotText}>Forgot PIN?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, submitting && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <Text style={styles.loginButtonText}>{submitting ? 'Signing In...' : 'Login'}</Text>
                        </TouchableOpacity>

                        <Text style={styles.btnTextBelow}>
                            Not registered yet?{' '}
                            <Text style={styles.joinNowText} onPress={() => router.push('/Career')}>
                                Apply as a Professional
                            </Text>
                        </Text>
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
        alignItems: 'center',
        paddingVertical: hp('4%'),
        backgroundColor: '#F5F9F8',
        marginTop: hp('1.5%'),
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        minHeight: hp('75%'),
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: hp('3%'),
        width: '100%',
        color: '#1a1a2e',
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderWidth: 2,
        width: '100%',
        marginBottom: hp('3%'),
        borderRadius: 14,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        alignItems: 'center',
        height: hp('6.5%'),
        backgroundColor: '#fff',
    },
    flagEmoji: { fontSize: 20 },
    textInput: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
        paddingHorizontal: hp('2%'),
        color: '#1a1a2e',
    },
    pinLabelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a2e',
        width: '100%',
        marginBottom: 8,
    },
    pinBoxesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: hp('1%'),
    },
    box: {
        width: 55,
        height: 55,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        textAlign: 'center',
        fontSize: 20,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        color: '#064E3B',
        fontWeight: '700',
    },
    forgotText: {
        color: '#6c757d',
        fontWeight: '600',
        fontSize: hp('1.5%'),
        alignSelf: 'flex-end',
        marginBottom: hp('3%'),
    },
    loginButton: {
        height: hp('6%'),
        width: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#064E3B',
    },
    loginButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1.5,
    },
    btnTextBelow: {
        color: '#6c757d',
        fontWeight: '500',
        fontSize: hp('1.5%'),
        marginTop: hp('3%'),
        textAlign: 'center',
    },
    joinNowText: {
        fontWeight: '900',
        color: '#064E3B',
    },
});

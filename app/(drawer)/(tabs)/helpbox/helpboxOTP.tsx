import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    NativeSyntheticEvent,
    TextInputKeyPressEventData
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
const { width, height } = Dimensions.get('window');
import { router, useLocalSearchParams } from 'expo-router';
import Header2 from '@/components/Header3drawer';
import { createHelpboxSB } from '@/api/supabase/createHelpboxSB';
import { sparrowOtpService } from '@/src/services/sparrowOtpService';

const scaleFont = (size: number) => {
    const guidelineBaseWidth = 375;
    return (size * width) / guidelineBaseWidth;
};

export default function HelpboxOTP() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const { phone } = useLocalSearchParams(); // Contains +977...

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(() => sparrowOtpService.getResendCooldownSeconds('helpbox'));

    // Filter country code for visual UI readability
    const displayPhone = phone ? String(phone).replace('+977', '') : '98*****011';

    useFocusEffect(
        React.useCallback(() => {
            setOtp(['', '', '', '']);
        }, []),
    );

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown(sparrowOtpService.getResendCooldownSeconds('helpbox'));
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleChange = (text: string, index: number) => {
        // Only allow numbers
        const cleanedText = text.replace(/[^0-9]/g, '');

        const newOtp = [...otp];
        newOtp[index] = cleanedText.slice(-1);
        setOtp(newOtp);

        // Moving FORWARD when typing a number
        if (cleanedText && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Moving BACKWARD when hitting backspace/deleting
        if (text === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendCode = async () => {
        const cooldown = sparrowOtpService.getResendCooldownSeconds('helpbox');
        if (cooldown > 0) {
            Alert.alert('Please Wait', `You can request a new code in ${cooldown}s.`);
            setResendCooldown(cooldown);
            return;
        }

        const targetPhone = sparrowOtpService.getLastPhone('helpbox');
        if (!targetPhone) return;

        try {
            Alert.alert('Resending', 'Requesting a new verification code...');

            const newOtp = sparrowOtpService.generateOtp();
            const sent = await sparrowOtpService.sendOtp(targetPhone, newOtp, 'helpbox');

            if (!sent) {
                Alert.alert('Resend Failed', 'Could not send a new verification code. Please try again.');
                return;
            }

            sparrowOtpService.setPendingOtp('helpbox', { otp: newOtp, phone: targetPhone });
            setResendCooldown(sparrowOtpService.getResendCooldownSeconds('helpbox'));

            Alert.alert('Success', 'A new code has been successfully sent.');
        } catch (error: any) {
            Alert.alert('Resend Failed', error.message || 'Unable to re-send verification code.');
        }
    };

    const handleNavigate = async () => {
        const enteredOtp = otp.join('');

        if (enteredOtp.length < 4) {
            Alert.alert('Validation Error', 'Please enter the complete 4-digit verification code.');
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const pending = sparrowOtpService.getPendingOtp('helpbox');

            if (!pending) {
                Alert.alert('Session Expired', 'No active verification session found. Please go back and try again.');
                setIsSubmitting(false);
                return;
            }

            if (enteredOtp !== pending.otp) {
                Alert.alert('Verification Failed', 'The code entered is invalid or has expired.');
                setIsSubmitting(false);
                return;
            }

            const booking = {
                "phone": phone,
            };

            await createHelpboxSB(booking);

            sparrowOtpService.clearPendingOtp('helpbox');

            router.push('/helpbox/otpVerifiedHB');

        } catch (error: any) {
            console.log("BOOKING OR VERIFICATION ERROR:", error);
            Alert.alert('Verification Failed', error.message || 'The code entered is invalid or has expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Header2 />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Text style={styles.thankYouText}>
                        Phone Verification
                    </Text>

                    <Text style={styles.bookingText}>
                        Enter the 4 digit code sent to your customer number {displayPhone} below.
                    </Text>

                    <Text style={styles.otpPromptText}>Enter your OTP to continue.</Text>

                    <View style={styles.otpBox}>
                        {otp.map((_, index) => (
                            <TextInput
                                key={index}
                                ref={ref => {
                                    inputRefs.current[index] = ref;
                                }}
                                style={styles.input}
                                keyboardType="numeric"
                                maxLength={1}
                                value={otp[index]} // Shows the actual typed number clearly
                                onChangeText={text => handleChange(text, index)}
                                onKeyPress={event => handleKeyPress(event, index)} // Kept as a backup helper for iOS
                            />
                        ))}
                    </View>

                    <TouchableOpacity onPress={handleResendCode} disabled={resendCooldown > 0}>
                        <Text style={styles.resendcode}>
                            {`Didn't get code?`}{' '}
                            <Text style={{ color: resendCooldown > 0 ? 'gray' : 'blue', fontWeight: 'bold' }}>
                                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
                        onPress={handleNavigate}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Verifying...' : 'Submit'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '5%',
        paddingTop: height * 0.09,
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    thankYouText: {
        marginTop: hp('3%'),
        fontSize: scaleFont(27),
        fontWeight: '500',
    },
    bookingText: {
        width: '70%',
        textAlign: 'center',
        marginBottom: height * 0.08,
        fontSize: scaleFont(13),
        marginTop: height * 0.03,
        fontWeight: '400',
        lineHeight: 23,
    },
    otpPromptText: {
        fontSize: scaleFont(16.5),
        marginBottom: height * 0.04,
        fontWeight: '400',
        color: 'green',
    },
    otpBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
    },
    input: {
        width: width * 0.12,
        height: width * 0.12,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'hsl(0, 0%, 79%)',
        borderRadius: 5,
        textAlign: 'center',
        fontSize: scaleFont(18),
        backgroundColor: '#fff',
        elevation: 3,
    },
    resendcode: {
        marginTop: 25,
        paddingHorizontal: 20,
        textAlign: 'center',
        lineHeight: 22,
        fontSize: hp('1.5%')
    },
    submitButton: {
        backgroundColor: 'green',
        height: height * 0.06,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        marginTop: height * 0.08,
    },
    submitButtonText: {
        fontSize: scaleFont(19),
        color: '#fff',
        fontWeight: '300',
    },
});

import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    Dimensions,
    StyleSheet,
} from 'react-native';
import EyeOffIcon from '../../assets/icons/admin/eyeOff.png';
import EyeOnIcon from '../../assets/icons/admin/eyeOn.png';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import Header5 from '@/components/Header5Admin';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '@/src/firebase/firebaseConfig';
import { useRequireRole } from '@/hooks/useRequireRole';

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get('window');

// Font scaling utility function
const scaleFont = (size: number) => {
    const guidelineBaseWidth = 375; // Base screen width to scale from
    return (size * width) / guidelineBaseWidth;
};

export default function AdminChangePassword() {
    const { authorized } = useRequireRole(['career', 'admin', 'superadmin']);
    const [passwordVisibleOLD, setPasswordVisibleOLD] = useState(false);
    const [passwordVisibleNEW, setPasswordVisibleNEW] = useState(false);
    const [passwordVisibleCONFIRM, setPasswordVisibleCONFIRM] = useState(false);


    const [oldPassword, setOldPassword] = useState<any>('');
    const [newPassword, setNewPassword] = useState<any>('');
    const [confirmNewpassword, setConfirmNewPassword] = useState<any>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const togglePasswordVisibilityOLD = () => {
        setPasswordVisibleOLD(!passwordVisibleOLD);
    };

    const togglePasswordVisibilityNEW = () => {
        setPasswordVisibleNEW(!passwordVisibleNEW);
    }

    const togglePasswordVisibilityCONFIRM = () => {
        setPasswordVisibleCONFIRM(!passwordVisibleCONFIRM);
    }

    const handleSubmit = async () => {
        if (!oldPassword || oldPassword.length !== 6) {
            Alert.alert('Validation Error', 'Please enter your current 6-digit PIN');
            return;
        }
        if (!newPassword || newPassword.length !== 6) {
            Alert.alert('Validation Error', 'Please enter a new 6-digit PIN');
            return;
        }
        if (newPassword !== confirmNewpassword) {
            Alert.alert('Validation Error', 'New PIN and confirmation do not match');
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            Alert.alert('Session Expired', 'Please log in again before changing your PIN.');
            router.replace('/admin/AdminLogin');
            return;
        }

        setIsSubmitting(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Alert.alert('Success', 'PIN updated successfully', [
                { text: 'OK', onPress: () => router.push('/Admin') },
            ]);
        } catch (error: any) {
            const message =
                error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
                    ? 'Your current PIN is incorrect.'
                    : error?.message || 'Failed to update PIN. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!authorized) {
        return null;
    }

    return (
        <View style={{ flex: 1 }} >
            <Header5 />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">


                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Change Password</Text>

                        <Text style={styles.welcomeText}>Choose a New Password</Text>
                        <Text style={styles.welcomeText2}>Enter and confirm your new password to regain access</Text>


                        {/* OLD pin */}
                        <Text style={styles.labelInput}>Old PIN</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder=""
                                placeholderTextColor={'hsl(0, 0%, 20%)'}
                                secureTextEntry={!passwordVisibleOLD}
                                style={styles.textInput}
                                value={oldPassword}
                                maxLength={6}
                                onChangeText={(text) =>
                                    setOldPassword(text.replace(/[^0-9]/g, '').slice(0, 6))
                                }
                            />
                            <TouchableOpacity onPress={togglePasswordVisibilityOLD}>
                                {passwordVisibleOLD ? (
                                    <Image source={EyeOnIcon} style={{ width: 23, height: 27, tintColor: 'hsl(0, 0%, 30%)' }} />

                                ) : (
                                    <Image source={EyeOffIcon} style={{ width: 22, height: 22, tintColor: 'hsl(0, 0%, 30%)' }} />
                                )}
                            </TouchableOpacity>
                        </View>
                        {/* new password */}
                        <Text style={styles.labelInput}>New PIN</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder=""
                                placeholderTextColor={'hsl(0, 0%, 20%)'}
                                secureTextEntry={!passwordVisibleNEW}
                                style={styles.textInput}
                                value={newPassword}
                                maxLength={6}
                                onChangeText={(text) =>
                                    setNewPassword(text.replace(/[^0-9]/g, '').slice(0, 6))
                                }
                            />
                            <TouchableOpacity onPress={togglePasswordVisibilityNEW}>
                                {passwordVisibleNEW ? (
                                    <Image source={EyeOnIcon} style={{ width: 23, height: 27, tintColor: 'hsl(0, 0%, 30%)' }} />

                                ) : (
                                    <Image source={EyeOffIcon} style={{ width: 22, height: 22, tintColor: 'hsl(0, 0%, 30%)' }} />
                                )}
                            </TouchableOpacity>
                        </View>
                        {/* confirem new password */}
                        <Text style={styles.labelInput}>Confirm New PIN</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder=""
                                placeholderTextColor={'hsl(0, 0%, 20%)'}
                                secureTextEntry={!passwordVisibleCONFIRM}
                                style={styles.textInput}
                                value={confirmNewpassword}
                                maxLength={6}
                                onChangeText={(text) =>
                                    setConfirmNewPassword(text.replace(/[^0-9]/g, '').slice(0, 6))
                                }
                            />
                            <TouchableOpacity onPress={togglePasswordVisibilityCONFIRM}>
                                {passwordVisibleCONFIRM ? (
                                    <Image source={EyeOnIcon} style={{ width: 23, height: 27, tintColor: 'hsl(0, 0%, 30%)' }} />

                                ) : (
                                    <Image source={EyeOffIcon} style={{ width: 22, height: 22, tintColor: 'hsl(0, 0%, 30%)' }} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.mainBtn}>
                            <TouchableOpacity style={styles.CancelButton} onPress={() => router.push('/(drawer)/admin/UpdateProfile')}>
                                <Text style={styles.CancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.loginButton, isSubmitting && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.loginButtonText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: hp('2%'),

    },

    divider: {
        borderBottomWidth: 1,
        borderColor: '#CAD2DF',
        marginTop: 16,
    },
    btnContainer: {
        // marginLeft: 200
    },
    btnText: {
        color: '#333',
        fontWeight: '500',
        textDecorationLine: 'underline',
        marginBottom: hp('0.3%')
    },

    formContainer: {
        paddingHorizontal: '5%',
        alignItems: 'center',
        paddingVertical: hp('3%'),
        width: '95%'
    },
    image: {
        width: wp('40%'),
        height: hp('15%'),
        resizeMode: 'contain',
        borderRadius: 200
    },
    title: {
        fontSize: hp('2.8%'),
        fontWeight: '600',
        color: 'green',
        width: '100%'

    },
    welcomeText: {
        marginTop: height * 0.04,
        fontSize: scaleFont(15),
        fontWeight: '600',
        width: '100%',
        color: 'hsl(0, 0%, 30%)'

    },
    welcomeText2: {
        fontSize: scaleFont(15),
        fontWeight: '500',
        marginTop: height * 0.01, // Margin adjusted based on screen height
        marginBottom: height * 0.05, // Margin adjusted based on screen height
        width: '100%',
        color: 'hsl(0, 0%, 50%)'

    },
    labelInput: {
        fontSize: hp('1.9%'),
        fontWeight: '600',
        width: '98%',
        marginBottom: hp('1.5%'),
        color: 'hsl(0, 0%, 30%)'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: hp('5.5%'),
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#d3d3d3',
        paddingHorizontal: 16,
        marginBottom: '7%',
        backgroundColor: '#f7f7f7'
    },
    textInput: {
        flex: 1,              //  VERY IMPORTANT
        fontSize: scaleFont(22),
        fontWeight: '800',
        paddingVertical: 0,
        textAlignVertical: 'center', //  Android fix
        letterSpacing: 3,
        color: 'hsl(0, 0%, 20%)',
        paddingHorizontal: 20

    },
    mainBtn: {
        width: '100%',
        justifyContent: "space-between",
        flexDirection: 'row',
        paddingTop: height * 0.13, // Adjusted button margin based on screen height
        marginBottom: hp('3%'),
        paddingHorizontal: wp('2%')
    },
    CancelButton: {
        height: height * 0.055,
        width: width * 0.35, // Adjust width based on screen size
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0,0.3)'
    },
    CancelButtonText: {
        fontSize: scaleFont(17),
        fontWeight: '700',
        color: '#000'
    },
    loginButton: {
        height: height * 0.055,
        width: width * 0.35, // Adjust width based on screen size
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green'
    },
    loginButtonText: {
        fontSize: scaleFont(17),
        fontWeight: '600',
        color: '#fff'
    },
    backButton: {
        position: 'absolute',
        top: 8,
        left: 10,
        zIndex: 10,
    },
    backBtn: {
        width: hp('4%'),
        height: hp('4%'),
        tintColor: 'green'
    }
});


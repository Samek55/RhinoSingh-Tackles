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
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Header5 from '@/components/Header5Admin';
import FileUploadBox from '@/components/bookings/FileUploadBox';
import { fetchBookingsFromSupabase } from '@/api/supabase/fetchBookingSB';
import { uploadMultipleImagesForBooking } from '@/src/utils/fileUploadBooking';
import { supabase } from '@/src/lib/supabase';
import { notifyJobCompleted } from '@/api/notifications';
import { useRequireRole } from '@/hooks/useRequireRole';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type FileItem = { uri: string; fileName?: string; sizeMB?: number; mimeType?: string; type?: 'image' | 'pdf' };

export default function WorkCompletionOTP() {
    const { authorized } = useRequireRole(['career', 'admin', 'superadmin']);
    const { id } = useLocalSearchParams<{ id: string }>();

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [photos, setPhotos] = useState<FileItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const otpRequestedRef = useRef(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await fetchBookingsFromSupabase();
                const safeData = Array.isArray(data) ? data : [];
                const found = safeData.find((item: any) => item && String(item.id) === String(id));
                setBooking(found || null);
            } catch (error) {
                console.error('Error loading booking:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    useEffect(() => {
        // Send the OTP once the booking (and thus the customer's phone) is loaded.
        // Guarded so React's dev double-invoke / a re-render doesn't fire it twice.
        if (!booking?.phone || otpRequestedRef.current) return;
        otpRequestedRef.current = true;

        (async () => {
            const { data, error } = await supabase.functions.invoke('send-otp', {
                body: { to: booking.phone, purpose: 'work-completion', greetingName: booking.fullName },
            });
            if (error || !data?.ok) {
                Alert.alert('Error', 'Could not send the completion code to the customer. Please try again.');
                return;
            }
            setOtpSent(true);
        })();
    }, [booking?.phone]);

    const handleVerifyAndComplete = async () => {
        if (photos.length === 0) {
            Alert.alert('Photo Required', 'Please upload at least one completion photo before verifying.');
            return;
        }
        if (otp.length < 4) {
            Alert.alert('Error', 'Please enter the code the customer received.');
            return;
        }

        setSubmitting(true);
        try {
            // Photos upload first, deliberately — verify-otp is single-use, so if the
            // upload failed after a successful verify the professional would be locked
            // out of retrying without a fresh code. Uploading first means a failure
            // here just means "try again," no code wasted.
            const photoUrls = await uploadMultipleImagesForBooking(photos);

            const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-otp', {
                body: { phone: booking.phone, purpose: 'work-completion', code: otp },
            });

            if (verifyError || !verifyResult?.success) {
                Alert.alert('Verification Failed', verifyResult?.error || 'Incorrect or expired code.');
                return;
            }

            const bookingPk = booking?.bookingId ?? booking?.bookingid;
            const { data: claimed, error: claimError } = await supabase.rpc('claim_booking_status', {
                p_booking_id: bookingPk,
                p_from_status: booking.status,
                p_to_status: 'Completed',
                p_extra: { completion_photos: JSON.stringify(photoUrls) },
            });

            if (claimError || !claimed) {
                Alert.alert('Error', 'This booking was already updated by someone else.');
                router.replace('/admin/BookingHistory');
                return;
            }

            notifyJobCompleted(booking.phone, String(bookingPk)).catch(() => {});

            Alert.alert('Success', 'Job marked as completed.', [
                { text: 'OK', onPress: () => router.replace('/admin/BookingHistory') },
            ]);
        } catch (error) {
            console.error('Work completion error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!authorized) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
            <Header5 />
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {loading ? (
                        <ActivityIndicator size="large" color="green" style={{ marginTop: hp('10%') }} />
                    ) : !booking ? (
                        <Text style={styles.loadingText}>No booking found.</Text>
                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.heading}>Mark Job Completed</Text>
                            <Text style={styles.subheading}>{booking.fullName} · {booking.phone}</Text>

                            <Text style={styles.statusNote}>
                                {otpSent
                                    ? `A completion code has been sent to the customer's phone.`
                                    : 'Sending completion code to the customer...'}
                            </Text>

                            <Text style={styles.label}>Completion Photos</Text>
                            <FileUploadBox value={photos} onChange={setPhotos} maxFiles={5} minFiles={1} />

                            <Text style={styles.label}>Completion Code</Text>
                            <TextInput
                                placeholder="Enter code from customer"
                                style={styles.otpInput}
                                keyboardType="number-pad"
                                value={otp}
                                onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 8))}
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                                onPress={handleVerifyAndComplete}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>Verify & Mark Completed</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7fb' },
    scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: hp('3%') },
    card: {
        width: wp('90%'),
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: wp('5%'),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    heading: { fontSize: hp('2.5%'), fontWeight: '700', color: '#222' },
    subheading: { fontSize: hp('1.8%'), color: '#555', marginTop: 4, marginBottom: hp('2%') },
    statusNote: { fontSize: hp('1.6%'), color: '#064E3B', marginBottom: hp('2%'), fontWeight: '600' },
    label: { fontSize: hp('1.8%'), fontWeight: '700', color: '#111', marginBottom: 6, marginTop: hp('1%') },
    otpInput: {
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.15)',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: hp('6%'),
        fontSize: 16,
        marginBottom: hp('2%'),
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#064E3B',
        borderRadius: 8,
        paddingVertical: hp('1.5%'),
        alignItems: 'center',
        marginTop: hp('1%'),
    },
    submitText: { color: '#fff', fontWeight: '700', fontSize: hp('1.7%') },
    loadingText: { alignSelf: 'center', marginTop: hp('10%'), color: 'gray' },
});

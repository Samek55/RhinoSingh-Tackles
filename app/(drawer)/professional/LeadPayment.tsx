import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import HeaderProfessional from '@/components/HeaderProfessional';
import { initiateLeadPayment, confirmLeadUnlock } from '@/api/khalti';
import { LEAD_FEE_NPR, LEAD_FEE_REGULAR_NPR } from '@/src/constants/leadFee';
import { useRequireNepal } from '@/hooks/useRequireNepal';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

type Stage = 'offer' | 'initiating' | 'waiting' | 'recording' | 'success' | 'error' | 'recordFailed';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_MS = 5 * 60 * 1000;

export default function LeadPayment() {
    const isNepal = useRequireNepal();
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const [stage, setStage] = useState<Stage>('offer');
    const [errorMessage, setErrorMessage] = useState('');
    const pidxRef = useRef<string | null>(null);
    const pollStartRef = useRef<number>(0);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, []);

    const stopPolling = () => {
        if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    };

    const poll = async () => {
        if (!pidxRef.current || !bookingId) return;

        if (Date.now() - pollStartRef.current > MAX_POLL_MS) {
            stopPolling();
            setErrorMessage('We could not confirm your payment in time. If you were charged, tap Retry.');
            setStage('recordFailed');
            return;
        }

        const { data, error } = await confirmLeadUnlock(Number(bookingId), pidxRef.current);

        if (error) {
            // No `status` field back at all is a real error (recording failed
            // after a real charge), not "still pending" — safe to retry without
            // re-charging since confirm is idempotent.
            stopPolling();
            setErrorMessage(error);
            setStage('recordFailed');
            return;
        }

        if (data?.success) {
            stopPolling();
            setStage('success');
            return;
        }

        if (data?.status === 'Expired' || data?.status === 'User canceled') {
            stopPolling();
            setErrorMessage('Payment was not completed.');
            setStage('error');
            return;
        }

        // Anything else (Pending, etc.) — keep polling.
    };

    const handlePayNow = async () => {
        setStage('initiating');
        const { data, error } = await initiateLeadPayment(String(bookingId));

        if (error || !data?.payment_url) {
            setErrorMessage(error || 'Could not start payment');
            setStage('error');
            return;
        }

        pidxRef.current = data.pidx;
        Linking.openURL(data.payment_url);

        setStage('waiting');
        pollStartRef.current = Date.now();
        pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    };

    const handleRetryRecording = () => {
        setStage('waiting');
        pollStartRef.current = Date.now();
        pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    };

    if (!isNepal) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <HeaderProfessional subtitle="Pay to Unlock Lead" />
            <View style={styles.container}>
                {stage === 'offer' && (
                    <View style={styles.card}>
                        <Text style={styles.title}>Unlock This Lead</Text>
                        <Text style={styles.priceRow}>
                            <Text style={styles.strike}>NPR {LEAD_FEE_REGULAR_NPR}</Text>{'  '}
                            <Text style={styles.price}>NPR {LEAD_FEE_NPR}</Text>
                        </Text>
                        <Text style={styles.subtitle}>Paid securely via Khalti</Text>
                        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
                            <Text style={styles.payButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(stage === 'initiating' || stage === 'waiting') && (
                    <View style={styles.card}>
                        <ActivityIndicator size="large" color="#064E3B" />
                        <Text style={styles.subtitle}>
                            {stage === 'initiating' ? 'Starting payment...' : 'Waiting for payment confirmation...'}
                        </Text>
                    </View>
                )}

                {stage === 'success' && (
                    <View style={styles.card}>
                        <Text style={styles.title}>Payment Successful ✅</Text>
                        <Text style={styles.subtitle}>You can now view this customer's contact details.</Text>
                        <TouchableOpacity
                            style={styles.payButton}
                            onPress={() => router.replace({ pathname: '/professional/LeadDetail', params: { bookingId } } as any)}
                        >
                            <Text style={styles.payButtonText}>View Booking</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(stage === 'error' || stage === 'recordFailed') && (
                    <View style={styles.card}>
                        <Text style={styles.titleError}>Payment Issue</Text>
                        <Text style={styles.subtitle}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={styles.payButton}
                            onPress={stage === 'recordFailed' ? handleRetryRecording : () => setStage('offer')}
                        >
                            <Text style={styles.payButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp('4%'), paddingTop: hp('4%'), alignItems: 'center' },
    card: {
        width: '100%',
        backgroundColor: '#f6f7fb',
        borderRadius: 18,
        padding: wp('6%'),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    title: { fontSize: hp('2.3%'), fontWeight: '800', color: '#1a1a2e', marginBottom: hp('1%') },
    titleError: { fontSize: hp('2.3%'), fontWeight: '800', color: '#b00020', marginBottom: hp('1%') },
    priceRow: { marginBottom: hp('1%') },
    strike: { fontSize: hp('1.8%'), color: '#999', textDecorationLine: 'line-through' },
    price: { fontSize: hp('2.3%'), color: '#064E3B', fontWeight: '800' },
    subtitle: { fontSize: hp('1.6%'), color: '#555', textAlign: 'center', marginTop: hp('1%'), marginBottom: hp('2%') },
    payButton: { backgroundColor: '#064E3B', borderRadius: 50, paddingVertical: hp('1.5%'), paddingHorizontal: wp('8%') },
    payButtonText: { color: '#fff', fontWeight: '700' },
});

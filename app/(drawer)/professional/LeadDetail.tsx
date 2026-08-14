import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import HeaderProfessional from '@/components/HeaderProfessional';
import { supabase } from '@/src/lib/supabase';
import { getProfessionalSession } from '@/api/supabase/professionalAuth';
import { LEAD_FEE_NPR, LEAD_FEE_REGULAR_NPR } from '@/src/constants/leadFee';
import { useRequireNepal } from '@/hooks/useRequireNepal';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function LeadDetail() {
    const isNepal = useRequireNepal();
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const session = await getProfessionalSession();
        if (!session) {
            router.replace('/professional/ProfessionalLogin' as any);
            return;
        }
        setLoading(true);
        const { data } = await supabase.functions.invoke('list-leads', { body: { token: session.token } });
        const found = (data?.leads ?? []).find((l: any) => String(l.bookingId) === String(bookingId));
        setLead(found || null);
        setLoading(false);
    }, [bookingId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    if (!isNepal) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <HeaderProfessional subtitle="Lead Details" />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#064E3B" style={{ marginTop: hp('8%') }} />
                ) : !lead ? (
                    <Text style={styles.emptyText}>Lead not found.</Text>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.name}>{lead.fullName}</Text>
                        <DetailRow label="Service" value={lead.service} />
                        <DetailRow label="Area" value={`${lead.area}${lead.city ? `, ${lead.city}` : ''}`} />
                        <DetailRow label="Budget" value={lead.budget || 'N/A'} />
                        <DetailRow label="Status" value={lead.status} />

                        {lead.unlocked ? (
                            <>
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${lead.phone}`)}>
                                    <DetailRow label="Phone" value={lead.phone} valueStyle={{ color: '#064E3B', textDecorationLine: 'underline' }} />
                                </TouchableOpacity>
                                <Text style={styles.unlockedNote}>You've unlocked this lead's contact details.</Text>
                            </>
                        ) : (
                            <View style={styles.paywall}>
                                <Text style={styles.paywallTitle}>Contact Locked</Text>
                                <Text style={styles.paywallText}>
                                    Pay <Text style={{ fontWeight: '800' }}>NPR {LEAD_FEE_NPR}</Text>{' '}
                                    <Text style={{ textDecorationLine: 'line-through', color: '#999' }}>NPR {LEAD_FEE_REGULAR_NPR}</Text>{' '}
                                    to view this customer's contact details.
                                </Text>
                                <TouchableOpacity
                                    style={styles.payButton}
                                    onPress={() => router.push({ pathname: '/professional/LeadPayment', params: { bookingId: lead.bookingId } } as any)}
                                >
                                    <Text style={styles.payButtonText}>Pay NPR {LEAD_FEE_NPR} to View Contact</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

function DetailRow({ label, value, valueStyle }: { label: string; value: string; valueStyle?: object }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, valueStyle]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp('4%'), paddingTop: hp('2%') },
    emptyText: { textAlign: 'center', marginTop: hp('8%'), color: 'gray' },
    card: {
        backgroundColor: '#f6f7fb',
        borderRadius: 18,
        padding: wp('5%'),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    name: { fontSize: hp('2.5%'), fontWeight: '800', color: '#1a1a2e', marginBottom: hp('2%') },
    row: { marginBottom: hp('1.5%') },
    label: { fontSize: hp('1.5%'), fontWeight: '700', color: '#666' },
    value: { fontSize: hp('1.8%'), color: '#1a1a2e', marginTop: 2 },
    paywall: {
        marginTop: hp('2%'),
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: wp('4%'),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
    },
    paywallTitle: { fontSize: hp('2%'), fontWeight: '700', color: '#b00020', marginBottom: 6 },
    paywallText: { fontSize: hp('1.6%'), color: '#555', textAlign: 'center', marginBottom: hp('1.5%') },
    payButton: { backgroundColor: '#064E3B', borderRadius: 50, paddingVertical: hp('1.5%'), paddingHorizontal: wp('6%') },
    payButtonText: { color: '#fff', fontWeight: '700' },
    unlockedNote: { fontSize: hp('1.5%'), color: '#064E3B', fontWeight: '600', marginTop: hp('1%') },
});

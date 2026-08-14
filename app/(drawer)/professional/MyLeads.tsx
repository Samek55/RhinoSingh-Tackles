import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import HeaderProfessional from '@/components/HeaderProfessional';
import { supabase } from '@/src/lib/supabase';
import { getProfessionalSession, logoutProfessional } from '@/api/supabase/professionalAuth';
import { useRequireNepal } from '@/hooks/useRequireNepal';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function MyLeads() {
    const isNepal = useRequireNepal();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLeads = useCallback(async () => {
        const session = await getProfessionalSession();
        if (!session) {
            router.replace('/professional/ProfessionalLogin' as any);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.functions.invoke('list-leads', {
            body: { token: session.token },
        });
        if (error || !data?.success) {
            if (data?.error === 'Please log in again') {
                await logoutProfessional();
                router.replace('/professional/ProfessionalLogin' as any);
                return;
            }
        }
        setLeads(data?.leads ?? []);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadLeads();
        }, [loadLeads])
    );

    const handleLogout = async () => {
        await logoutProfessional();
        router.replace('/professional/ProfessionalLogin' as any);
    };

    if (!isNepal) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <HeaderProfessional subtitle="My Leads" />
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Text style={styles.title}>Available Leads ({leads.length})</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#064E3B" style={{ marginTop: hp('5%') }} />
                ) : leads.length === 0 ? (
                    <Text style={styles.emptyText}>No matching leads right now. Check back soon.</Text>
                ) : (
                    <FlatList
                        data={leads}
                        keyExtractor={(item) => String(item.bookingId)}
                        contentContainerStyle={{ paddingBottom: hp('10%') }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push({ pathname: '/professional/LeadDetail', params: { bookingId: item.bookingId } } as any)}
                            >
                                <View style={styles.cardTop}>
                                    <Text style={styles.cardTitle}>{item.fullName}</Text>
                                    {item.unlocked && <Text style={styles.unlockedBadge}>Unlocked</Text>}
                                </View>
                                <Text style={styles.cardSubtitle}>{item.service}</Text>
                                <Text style={styles.cardSubtitle}>{item.area}{item.city ? `, ${item.city}` : ''}</Text>
                                <Text style={styles.cardPhone}>{item.phone}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp('4%') },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp('2%'), marginBottom: hp('1.5%') },
    title: { fontSize: hp('2.2%'), fontWeight: '700', color: '#064E3B' },
    logoutText: { color: '#b00020', fontWeight: '600' },
    emptyText: { textAlign: 'center', marginTop: hp('8%'), color: 'gray' },
    card: {
        backgroundColor: '#f6f7fb',
        borderRadius: 14,
        padding: wp('4%'),
        marginBottom: hp('1.5%'),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: hp('2%'), fontWeight: '700', color: '#1a1a2e' },
    unlockedBadge: { fontSize: hp('1.3%'), color: '#064E3B', fontWeight: '700', backgroundColor: '#d7edd7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    cardSubtitle: { fontSize: hp('1.6%'), color: '#555', marginTop: 2 },
    cardPhone: { fontSize: hp('1.6%'), color: '#064E3B', fontWeight: '600', marginTop: 4 },
});

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    FlatList,
} from 'react-native';
import SearchIcon from '../../../assets/images/TabIcon/searchbar.png';
import Header4 from '@/components/Header4Admin';
import { router, useFocusEffect } from 'expo-router';
import { fetchBookingsFromSupabase } from '@/api/supabase/fetchBookingSB';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useRequireSuperAdmin } from '@/hooks/useRequireSuperAdmin';

const OPEN_STATUSES = ['new', 'open'];

export default function SuperAdminHistory() {
    const authorized = useRequireSuperAdmin();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const lastDataRef = useRef<string>('');

    const loadBookings = useCallback(async () => {
        try {
            const data = await fetchBookingsFromSupabase();
            const safeData = Array.isArray(data) ? data : [];
            // Cheap id:status signature diff so a 15s poll doesn't force a
            // re-render (and re-filter/re-sort) when nothing actually changed.
            const signature = safeData.map((b) => `${b.id}:${b.status}`).join('|');
            if (signature === lastDataRef.current) return;
            lastDataRef.current = signature;
            setBookings(safeData);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadBookings();
            const intervalId = setInterval(loadBookings, 15000);
            return () => clearInterval(intervalId);
        }, [loadBookings])
    );

    const filteredData = useMemo(() => {
        let data = [...bookings];

        if (startDate) {
            const start = new Date(startDate).getTime();
            data = data.filter((b) => b.rawBookingDate && new Date(b.rawBookingDate).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate).getTime();
            data = data.filter((b) => b.rawBookingDate && new Date(b.rawBookingDate).getTime() <= end);
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            data = data.filter((item) =>
                String(item.bookingId || '').toLowerCase().includes(query) ||
                String(item.fullName || '').toLowerCase().includes(query) ||
                String(item.phone || '').toLowerCase().includes(query)
            );
        }

        return data;
    }, [bookings, searchQuery, startDate, endDate]);

    const handlePress = useCallback((item: any) => {
        const status = (item.status || '').toLowerCase().trim();
        const isOpen = OPEN_STATUSES.some((s) => status.includes(s));
        router.push({
            pathname: isOpen ? '/admin/BookingDetails_1' : '/admin/BookingDetails_2',
            params: { id: item.id },
        });
    }, []);

    const renderItem = useCallback(({ item }: any) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <Text style={styles.cardTitle}>{item.fullName || 'N/A'}</Text>
            <Text style={styles.cardSubtitle}>Booking ID: {item.bookingId || 'N/A'}</Text>
            <View style={styles.cardRow}>
                <Text style={styles.cardPhone}>{item.phone}</Text>
                <Text style={styles.cardStatus}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    ), [handlePress]);

    if (!authorized) {
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header4 />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.title}>All Bookings ({filteredData.length})</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Image source={SearchIcon} style={{ height: 20, width: 20 }} />
                    <TextInput
                        placeholder="Search ID, name or phone..."
                        placeholderTextColor="rgba(67, 67, 67,0.8)"
                        style={styles.textInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.dateRow}>
                    <TextInput
                        placeholder="Start date (YYYY-MM-DD)"
                        placeholderTextColor="rgba(67, 67, 67,0.8)"
                        style={styles.dateInput}
                        value={startDate}
                        onChangeText={setStartDate}
                    />
                    <TextInput
                        placeholder="End date (YYYY-MM-DD)"
                        placeholderTextColor="rgba(67, 67, 67,0.8)"
                        style={styles.dateInput}
                        value={endDate}
                        onChangeText={setEndDate}
                    />
                </View>

                {loading ? (
                    <Text style={{ alignSelf: 'center', marginTop: 20 }}>Loading bookings...</Text>
                ) : filteredData.length === 0 ? (
                    <Text style={{ alignSelf: 'center', marginTop: 20, color: 'gray' }}>No bookings to display.</Text>
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderItem}
                        keyExtractor={(item) => String(item.id)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: hp('15%'), paddingHorizontal: wp('4%') }}
                    />
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp('4%'), marginTop: hp('1.5%'), height: hp('5%') },
    title: { fontSize: hp('2.3%'), fontWeight: '600', color: 'green', marginLeft: wp('2%') },
    inputContainer: { flexDirection: 'row', paddingHorizontal: hp('2%'), borderWidth: 1.5, width: '90%', marginBottom: hp('1.5%'), borderRadius: 200, borderColor: 'rgba(0, 0, 0,0.3)', height: hp('5%'), marginTop: hp('2%'), alignItems: 'center', alignSelf: 'center' },
    textInput: { flex: 1, fontSize: hp(1.8), fontWeight: '500', color: '#000', paddingLeft: 8, letterSpacing: 0.3 },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp('4%'), marginBottom: hp('2%'), gap: wp('2%') },
    dateInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.15)',
        borderRadius: 10,
        paddingHorizontal: wp('2%'),
        paddingVertical: hp('1%'),
        fontSize: hp('1.5%'),
        color: '#000',
    },
    card: {
        backgroundColor: '#f6f7fb',
        borderRadius: 14,
        padding: wp('4%'),
        marginBottom: hp('1.5%'),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    cardTitle: { fontSize: hp('2%'), fontWeight: '700', color: '#1a1a2e' },
    cardSubtitle: { fontSize: hp('1.5%'), color: '#666', marginTop: 2 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: hp('1%') },
    cardPhone: { fontSize: hp('1.6%'), color: '#064E3B', fontWeight: '600' },
    cardStatus: { fontSize: hp('1.6%'), color: '#555', fontWeight: '600' },
});

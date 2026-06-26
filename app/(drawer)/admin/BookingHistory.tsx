import React, { useMemo, useCallback, useState, useRef } from 'react';
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
    Alert
} from 'react-native';

import leftArrowIcon from '../../../assets/icons/admin/leftarrow.png';
import SearchIcon from '../../../assets/images/TabIcon/searchbar.png';

import BookingCard from '../../../components/admin/BookingCard';
import Header4 from '@/components/Header4Admin';
import { router, useFocusEffect } from 'expo-router';
import { fetchBookingsFromSupabase } from '@/api/supabase/fetchBookingSB';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import { signOut } from "firebase/auth";
import { auth } from '@/src/firebase/firebaseConfig';

export default function BookingHistory() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const lastDataRef = useRef<string>('');

    // FETCH BOOKINGS (Kept clean and simple)
    const loadBookings = useCallback(async () => {
        try {
            const data = await fetchBookingsFromSupabase();
            const serialized = JSON.stringify(data);

            if (serialized === lastDataRef.current) return;

            lastDataRef.current = serialized;
            setBookings(data || []);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // FIXED: Safely setup polling intervals without recreating loops
    useFocusEffect(
        useCallback(() => {
            loadBookings();

            const intervalId = setInterval(() => {
                loadBookings();
            }, 15000);

            return () => {
                clearInterval(intervalId);
            };
        }, [loadBookings])
    );

    const toggleCard = useCallback((id: string) => {
        setOpenId(prev => (prev === id ? null : id));
    }, []);

    const handlePress = useCallback((id: string) => {
        const selectedBooking = bookings.find(b => b.id === id);
        const currentStatus = selectedBooking?.status?.toLowerCase()?.trim() || '';

        const isHistorical = ['completed', 'pending', 'cancel'].some(status =>
            currentStatus.includes(status)
        );

        router.push({
            pathname: isHistorical ? '/admin/BookingDetails_2' : '/admin/BookingDetails_1',
            params: { id },
        });
    }, [bookings]);

    // FILTER & SEARCH BOOKINGS 
    const filteredData = useMemo(() => {
        let data = [...bookings]; // Create a copy to protect original state tracking

        // 1. Apply Status Filter
        if (filter !== 'All') {
            data = data.filter(item => {
                const status = (item.status || '').toLowerCase().trim();
                if (filter === 'Cancelled') return status.includes('cancel');
                if (filter === 'New / Open') return status.includes('new') || status.includes('open');
                return status.includes(filter.toLowerCase());
            });
        }

        // 2. Apply Text Search Filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            data = data.filter(item => {
                const bookingId = String(item.bookingId || '').toLowerCase();
                const customerName = String(item.fullName || '').toLowerCase();
                const phoneNumber = String(item.phone || '').toLowerCase();

                return (
                    bookingId.includes(query) ||
                    customerName.includes(query) ||
                    phoneNumber.includes(query)
                );
            });
        }

        // 3. Client-side Sort validation fallback (using accurate ISO timestamps)
        data.sort((a, b) => {
            const timeA = a.rawBookingDate ? new Date(a.rawBookingDate).getTime() : 0;
            const timeB = b.rawBookingDate ? new Date(b.rawBookingDate).getTime() : 0;
            return timeB - timeA; // Newest date strings bubble to index 0
        });

        return data;
    }, [filter, searchQuery, bookings]);
    
    const renderItem = useCallback(({ item }: any) => (
        <BookingCard
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggleCard(item.id)}
            onPress={() => handlePress(item.id)}
        />
    ), [openId, toggleCard, handlePress]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            try {
                const { OneSignal } = require('react-native-onesignal');
                OneSignal.logout();
            } catch (e) {
                console.warn('OneSignal clean-up failure:', e);
            }

            Alert.alert("Logged Out", "You have been logged out successfully.", [
                { text: "OK", onPress: () => router.replace('/admin/AdminLogin') }
            ]);
        } catch (error: any) {
            Alert.alert("Logout Error", error.message);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header4 />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={styles.headerRow}>
                    {/* <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
                        <Image source={leftArrowIcon} style={styles.backBtn} />
                    </TouchableOpacity> */}
                    <Text style={styles.title}>Booking History</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Image source={SearchIcon} style={{ height: 20, width: 20 }} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={'rgba(67, 67, 67,0.8)'}
                        style={styles.textInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.mainBtns}>
                    {['All', 'New / Open', 'Completed', 'Pending', 'Cancelled'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.btn, filter === f && styles.activeBtn]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={styles.btnText}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: hp('15%') }}
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={7}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                    keyboardDismissMode="on-drag"
                />
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp('4%'), marginTop: hp('1.5%'), height: hp('5%') },
    title: { fontSize: hp('2.3%'), fontWeight: '600', color: 'green', marginLeft: wp('2%') },
    backButton: { padding: 4 },
    backBtn: { width: hp('3.5%'), height: hp('3.5%'), tintColor: 'green' },
    inputContainer: { flexDirection: 'row', paddingHorizontal: hp('2%'), borderWidth: 1.5, width: '90%', marginBottom: '5%', borderRadius: 200, borderColor: 'rgba(0, 0, 0,0.3)', height: hp('5%'), marginTop: hp('2%'), alignItems: 'center', alignSelf: 'center' },
    textInput: { flex: 1, fontSize: hp(1.8), fontWeight: '500', color: '#000', paddingLeft: 8, letterSpacing: 0.3 },
    mainBtns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: wp('4%'), paddingBottom: hp('3%') },
    btn: { backgroundColor: '#d7edd7', paddingHorizontal: wp('4%'), paddingVertical: hp('0.8%'), borderRadius: 20, alignItems: 'center', marginRight: wp('2%'), marginBottom: hp('1.5%') },
    activeBtn: { backgroundColor: '#b3dbb3' },
    btnText: { fontSize: wp('3.4%'), fontWeight: '500', color: 'rgba(0,0,0,0.7)' }
});
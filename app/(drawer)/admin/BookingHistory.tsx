import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
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
import { fetchBookingsFromAirtable } from '../../../api/helper/fetchBookingDataAirtable';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from "firebase/auth";
import { auth } from '@/src/firebase/firebaseConfig';



export default function BookingHistory() {

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [filter, setFilter] = useState('All');

    // 🚀 cache to avoid unnecessary re-renders
    const lastDataRef = useRef<string>('');
    const intervalRef = useRef<any>(null);

    // -----------------------------
    // FETCH BOOKINGS (OPTIMIZED)
    // -----------------------------
    const loadBookings = useCallback(async () => {
        try {
            const data = await fetchBookingsFromAirtable();

            const serialized = JSON.stringify(data);

            // 🚀 skip update if nothing changed
            if (serialized === lastDataRef.current) return;

            lastDataRef.current = serialized;
            setBookings(data || []);

        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // -----------------------------
    // FOCUS + POLLING
    // -----------------------------
    useFocusEffect(
        useCallback(() => {

            // initial load
            loadBookings();

            // polling
            intervalRef.current = setInterval(() => {
                loadBookings();
            }, 15000);

            return () => {
                clearInterval(intervalRef.current);
            };
        }, [loadBookings])
    );

    // -----------------------------
    // TOGGLE CARD
    // -----------------------------
    const toggleCard = useCallback((id: string) => {
        setOpenId(prev => (prev === id ? null : id));
    }, []);

    // -----------------------------
    // NAVIGATION (OPTIMIZED)
    // -----------------------------
    // -----------------------------
    // NAVIGATION (WITH CONDITIONAL ROUTING)
    // -----------------------------
    const handlePress = useCallback((id: string) => {
        // Find the specific booking object from our state array
        const selectedBooking = bookings.find(b => b.id === id);

        // Normalize the status string to lowercase for safe matching
        const currentStatus = selectedBooking?.status?.toLowerCase()?.trim() || '';

        // Check if the status matches any of your 3 specific criteria
        if (
            currentStatus.includes('completed') ||
            currentStatus.includes('pending') ||
            currentStatus.includes('cancel') // handles both 'Cancel' and 'Cancelled'
        ) {
            // Route directly to standard BookingDetails
            router.push({
                pathname: '/admin/BookingDetails_2',
                params: { id },
            });
        } else {
            // Fallback for all other statuses (e.g., "New / Open") to Details_1
            router.push({
                pathname: '/admin/BookingDetails_1',
                params: { id },
            });
        }
    }, [bookings]);

    // -----------------------------
    // SORT BOOKINGS
    // -----------------------------
    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => {
            const aId = Number(a.bookingId) || 0;
            const bId = Number(b.bookingId) || 0;
            return bId - aId;
        });
    }, [bookings]);

    // -----------------------------
    // FILTER BOOKINGS
    // -----------------------------
    const filteredData = useMemo(() => {
        if (filter === 'All') return sortedBookings;

        return sortedBookings.filter(item => {
            const status = (item.status || '')
                .toLowerCase()
                .trim();

            return status === filter.toLowerCase();
        });
    }, [filter, sortedBookings]);

    // -----------------------------
    // RENDER ITEM (MEMO SAFE)
    // -----------------------------
    const renderItem = useCallback(({ item }: any) => {
        return (
            <BookingCard
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggleCard(item.id)}
                onPress={() => handlePress(item.id)}
            />
        );
    }, [openId, toggleCard, handlePress]);

    const handleLogout = async () => {
        try {
            await signOut(auth);

            try {
                const { OneSignal } = require('react-native-onesignal');
                OneSignal.logout();
            } catch (e) {
                console.warn('OneSignal clean-up failure:', e);
            }

            Alert.alert(
                "Logged Out",
                "You have been logged out successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.replace('/admin/AdminLogin');
                        }
                    }
                ]
            );

        } catch (error: any) {
            alert("Logout error: " + error.message);
        }
    };


    return (
        <View style={{ flex: 1 }}>
            <Header4 />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >

                {/* HEADER */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleLogout}
                >
                    <Image source={leftArrowIcon} style={styles.backBtn} />
                    <Text style={styles.title}>Booking History</Text>
                </TouchableOpacity>

                {/* SEARCH */}
                <View style={styles.inputContainer}>
                    <Image source={SearchIcon} style={{ height: 20, width: 20 }} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={'rgba(67, 67, 67,0.8)'}
                        style={styles.textInput}
                    />
                </View>

                {/* FILTERS */}
                <View style={styles.mainBtns}>
                    {['All', 'Completed', 'Pending', 'Cancelled'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={styles.btn}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={styles.btnText}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* LIST */}
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: hp('15%') }}

                    // 🚀 PERFORMANCE BOOST
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={7}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                />

            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    header: {
        marginTop: hp('2%'),
        paddingHorizontal: wp('4%'),
    },

    divider: {
        borderBottomWidth: 1,
        borderColor: '#CAD2DF',
        marginTop: 16,
    },

    title: {
        position: 'absolute',
        top: hp('0.2%'),
        left: hp('5%'),
        width: hp('30%'),
        fontSize: hp('2.3%'),
        fontWeight: '600',
        color: 'green'

    },
    backButton: {
        position: 'absolute',
        top: 4,
        left: 3,
        zIndex: 10,
    },
    backBtn: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        tintColor: 'green'
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: hp('3.5%'),
        borderWidth: 1.5,
        width: '90%',
        marginBottom: '5%',
        borderRadius: 200,
        borderColor: 'rgba(0, 0, 0,0.3)',
        height: hp('5%'),
        marginTop: hp('8%'),
        alignItems: 'center',
        alignSelf: 'center',
    },
    textInput: {
        fontSize: hp(1.8),
        fontWeight: '500',
        color: '#000',
        paddingLeft: 8,
        letterSpacing: 0.3,
    },
    mainBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp('4%'),
        paddingBottom: hp('4%'),
    },

    btn: {
        backgroundColor: '#d7edd7',
        paddingHorizontal: wp('3.5%'),
        paddingVertical: hp('0.7%'),
        borderRadius: 20,
        alignItems: 'center',
    },

    btnText: {
        fontSize: wp('3.2%'),
        fontWeight: '500',
        color: 'rgba(0,0,0,0.7)',
    },
    BookingCard: {
        marginTop: hp('5%'),
    }
});

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    Modal,
} from 'react-native';

import leftArrowIcon from '../../../assets/icons/admin/leftarrow.png';
import LocationPin from '../../../assets/icons/contact/location-pin.png';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router, useLocalSearchParams } from 'expo-router';
import Header5 from '@/components/Header5Admin';
import { fetchBookingsFromSupabase } from '@/api/supabase/fetchBookingSB';

export default function BookingDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Single unified fetch logic entirely mapped to Supabase with structural defenses
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
                console.error("Error fetching booking details from Supabase:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const photos = [
        require('../../../assets/services/HomeRepairANDMaintenance/carpentry.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/handyman.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/electrical.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/washing-machine-repair.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/flooring.jpg'),
    ];

    const openImage = (index: number) => {
        setSelectedIndex(index);
        setVisible(true);
    };

    const goPrev = () => setSelectedIndex(i => (i - 1 + photos.length) % photos.length);
    const goNext = () => setSelectedIndex(i => (i + 1) % photos.length);

    const handleAcceptOffer = () => {
        if (!booking) return;

        // The customer is notified from BookingDetails_2 instead, once the admin actually
        // submits a real status there — sending it here fired "Booking Accepted" on every
        // tap of this button, even if the admin then backed out or picked Cancelled next.
        const routeId = booking?.id ? String(booking.id) : '';

        router.push({
            pathname: '/admin/BookingDetails_2',
            params: { id: routeId },
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
            <Header5 />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                {/* SAFE HEADER BAR CONTAINER */}
                <View style={styles.topNavigationHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Image source={leftArrowIcon} style={styles.backIcon} />
                        <Text style={styles.title}>
                            {booking?.bookingId ? `Booking ID: ${booking.bookingId}` : 'Booking Details'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading details...</Text>
                    ) : booking ? (
                        <View style={styles.card}>
                            <Text style={styles.heading}>{booking?.fullName || 'N/A'}</Text>
                            <Text style={styles.bookingId}>Booking ID : {booking?.bookingId || 'N/A'}</Text>

                            <View style={styles.rowflex}>
                                <Text style={styles.labelFlex}>Service(s)</Text>
                                <Text style={styles.valueFlex}>{booking?.service || 'N/A'}</Text>
                            </View>

                            <View style={styles.rowflex}>
                                <Text style={styles.labelFlex}>Budget</Text>
                                <Text style={[styles.valueFlex, { paddingLeft: hp('4%') }]}>{booking?.budget || 'N/A'}</Text>
                            </View>

                            <View style={styles.rowLocation}>
                                <View style={styles.rowLocationInside}>
                                    <Text style={styles.labelFlex}>Location</Text>
                                    <Text style={[styles.value, { paddingLeft: hp('3%'), flex: 1 }]}>
                                        {booking?.area || ''}{booking?.city ? `, ${booking.city}` : 'N/A'}
                                    </Text>
                                </View>
                                <View>
                                    <Image source={LocationPin} style={{ height: 20, width: 20 }} />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Booking Date & Time</Text>
                                <Text style={styles.value}>{booking?.bookingDate || 'N/A'}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Service Starting Date & Time</Text>
                                <Text style={styles.value}>{booking?.startingDate || 'N/A'}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Service Ending Date & Time</Text>
                                <Text style={styles.value}>{booking?.completionDate || 'N/A'}</Text>
                            </View>

                            <View style={styles.rowflex}>
                                <Text style={styles.labelFlex}>Approx Days to complete</Text>
                                <Text style={styles.valueFlex}>10 Days</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Special Request</Text>
                                <Text style={[styles.value, { paddingTop: hp('1%') }]}>
                                    {booking?.specialRequests || 'None'}
                                </Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Photos</Text>
                                <View style={styles.photos}>
                                    {photos.map((image, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => openImage(index)}
                                        >
                                            <Image source={image} style={styles.photoItem} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Fullscreen Carousel Modal Popup */}
                                <Modal
                                    visible={visible}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={() => setVisible(false)}
                                >
                                    <View style={styles.modalContainer}>
                                        <TouchableOpacity
                                            style={StyleSheet.absoluteFill}
                                            activeOpacity={1}
                                            onPress={() => setVisible(false)}
                                        />

                                        <Image
                                            source={photos[selectedIndex]}
                                            style={styles.fullImage}
                                            resizeMode="contain"
                                        />

                                        <Text style={styles.photoCounter}>
                                            {selectedIndex + 1} / {photos.length}
                                        </Text>

                                        <TouchableOpacity style={styles.arrowLeft} onPress={goPrev}>
                                            <Text style={styles.arrowText}>‹</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.arrowRight} onPress={goNext}>
                                            <Text style={styles.arrowText}>›</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Modal>
                            </View>

                            {/* Actions layout containers */}
                            <View style={styles.ButtonContainer}>
                                <TouchableOpacity
                                    style={styles.AcceptButton}
                                    onPress={handleAcceptOffer}
                                >
                                    <Text style={styles.AcceptText}>Accept This Offer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.RejectButton}
                                    onPress={() => router.push('/admin/BookingHistory')}
                                >
                                    <Text style={styles.AcceptText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.loadingText}>No details found for this booking.</Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7fb',
    },
    topNavigationHeader: {
        width: '100%',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('1.5%'),
        backgroundColor: '#f6f7fb',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIcon: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        tintColor: 'green',
        marginRight: wp('2%'),
    },
    title: {
        fontSize: hp('2.3%'),
        fontWeight: '600',
        color: 'green',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: hp('5%'),
    },
    card: {
        width: wp('90%'),
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('5%'),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        marginTop: hp('1%'),
    },
    heading: {
        fontSize: hp('2.8%'),
        fontWeight: '700',
        color: '#222',
    },
    bookingId: {
        fontSize: hp('1.2%'),
        marginBottom: hp('1%'),
        color: '#666',
    },
    row: {
        marginBottom: hp('1.8%'),
        paddingBottom: hp('1%'),
    },
    rowflex: {
        marginBottom: hp('1.8%'),
        flexDirection: 'row',
    },
    rowLocationInside: {
        flexDirection: 'row',
        flex: 1,
    },
    rowLocation: {
        marginBottom: hp('1.8%'),
        paddingBottom: hp('1%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: hp('1.8%'),
        fontWeight: '700',
        color: '#111',
        marginBottom: hp('1%'),
    },
    labelFlex: {
        fontSize: hp('1.8%'),
        fontWeight: '700',
        color: '#111',
    },
    value: {
        fontSize: hp('1.8%'),
        fontWeight: '500',
        color: '#555',
        lineHeight: hp('2.3%'),
    },
    valueFlex: {
        fontSize: hp('1.8%'),
        fontWeight: '500',
        color: '#555',
        lineHeight: hp('2.3%'),
        textAlignVertical: 'center',
        flex: 1,
        flexWrap: 'wrap',
        paddingLeft: hp('1.5%'),
    },
    ButtonContainer: {
        marginTop: hp('1%'),
        marginBottom: hp('2%'),
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    AcceptButton: {
        paddingVertical: hp('1.5%'),
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0,0.1)',
        elevation: 3,
        width: '100%',
    },
    AcceptText: {
        fontSize: hp('1.6%'),
        fontWeight: '500',
        color: '#fff',
        letterSpacing: 0.5,
    },
    RejectButton: {
        paddingVertical: hp('1.5%'),
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0,0.1)',
        elevation: 3,
        width: '100%',
        marginTop: hp('2%'),
    },
    photos: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: wp('2%'),
    },
    photoItem: {
        height: 40,
        width: 50,
        marginVertical: hp('1%'),
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '70%',
    },
    photoCounter: {
        position: 'absolute',
        bottom: hp('12%'),
        color: '#fff',
        fontSize: hp('2%'),
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.5%'),
        borderRadius: 20,
    },
    arrowLeft: {
        position: 'absolute',
        left: wp('4%'),
        top: '50%',
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 30,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowRight: {
        position: 'absolute',
        right: wp('4%'),
        top: '50%',
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 30,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: '#fff',
        fontSize: 32,
        lineHeight: 36,
        fontWeight: '300',
    },
    loadingText: {
        fontSize: hp('2%'),
        color: '#555',
        marginTop: hp('10%'),
        textAlign: 'center',
    },
});
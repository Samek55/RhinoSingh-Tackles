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
import { fetchBookingsFromAirtable } from '../../../api/helper/fetchBookingDataAirtable';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header4 from '@/components/Header4Admin';
import { router, useLocalSearchParams } from 'expo-router';

export default function BookingDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    
    // Fixed initialization type mismatch from [] to null
    const [selectedImage, setSelectedImage] = useState<any>(null);

    // Runs ONLY ONCE when the component mounts
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchBookingsFromAirtable();
                const found = data.find((item: any) => item.id === id);
                setBooking(found || null);
            } catch (error) {
                console.error("Error fetching booking details:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    // Static assets
    const photos = [
        require('../../../assets/services/HomeRepairANDMaintenance/carpentry.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/handyman.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/electrical.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/washing-machine-repair.jpg'),
        require('../../../assets/services/HomeRepairANDMaintenance/flooring.jpg'),
    ];

    const openImage = (image: any) => {
        setSelectedImage(image);
        setVisible(true);
    };

    return (
        <View style={{ flex: 1 }}>
            <Header4 />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* HEADER */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={leftArrowIcon} style={styles.backIcon} />
                            <Text style={styles.title}>Booking Details_1</Text>
                        </View>
                    </TouchableOpacity>

                    {/* BIG CARD */}
                    {loading ? (
                        <Text style={styles.loadingText}>Loading details...</Text>
                    ) : booking ? (
                        <View style={styles.card}>
                            <Text style={styles.heading}>{booking?.fullName}</Text>
                            <Text style={styles.bookingId}>Booking ID : {booking?.bookingId}</Text>

                            <View style={styles.rowflex}>
                                <Text style={styles.labelFlex}>Service(s)</Text>
                                <Text style={styles.valueFlex}>{booking?.service}</Text>
                            </View>

                            <View style={styles.rowflex}>
                                <Text style={styles.labelFlex}>Budget</Text>
                                <Text style={[styles.valueFlex, { paddingLeft: hp('4%') }]}>{booking?.budget}</Text>
                            </View>

                            <View style={styles.rowLocation}>
                                <View style={styles.rowLocationInside}>
                                    <Text style={styles.labelFlex}>Location</Text>
                                    <Text style={[styles.value, { paddingLeft: hp('3%'), flex: 1 }]}>
                                        {booking?.area}, {booking?.city}
                                    </Text>
                                </View>
                                <View>
                                    <Image source={LocationPin} style={{ height: 20, width: 20 }} />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Booking Date & Time</Text>
                                <Text style={styles.value}>{booking?.bookingDate}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Service Starting Date & Time</Text>
                                <Text style={styles.value}>{booking?.startingDate}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Service Ending Date & Time</Text>
                                <Text style={styles.value}>{booking?.completionDate}</Text>
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
                                            onPress={() => openImage(image)}
                                        >
                                            <Image source={image} style={styles.photoItem} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Fullscreen Popup */}
                                <Modal
                                    visible={visible}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={() => setVisible(false)}
                                >
                                    <TouchableOpacity
                                        style={styles.modalContainer}
                                        activeOpacity={1}
                                        onPress={() => setVisible(false)}
                                    >
                                        {selectedImage && (
                                            <Image
                                                source={selectedImage}
                                                style={styles.fullImage}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </TouchableOpacity>
                                </Modal>
                            </View>

                            {/* ButtonContainer */}
                            <View style={styles.ButtonContainer}>
                                <TouchableOpacity
                                    style={styles.AcceptButton}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/admin/BookingDetails_2',
                                            params: {
                                                id: booking?.id?.toString(),
                                            },
                                        });
                                    }}
                                >
                                    <Text style={styles.AcceptText}>Accept This Offer</Text>
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
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: hp('5%'),
        paddingTop: hp('8%'),
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: hp('1%'),
        marginLeft: wp('3%'),
        position: 'absolute',
        top: hp('-1%'),
        left: hp('-1%'),
        zIndex: 999,
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
    loadingText: {
        fontSize: hp('2%'),
        color: '#555',
        marginTop: hp('10%'),
        textAlign: 'center',
    },
});
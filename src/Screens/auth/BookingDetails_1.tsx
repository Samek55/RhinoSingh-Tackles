import React,{useState} from 'react';
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

import HeaderComponentAdmin from '../../components/admin/HeaderComponentAdmin';
import leftArrowIcon from '../../assets/icons/admin/leftarrow.png';
import { personBooking } from '../../data/AdminData/PersonBookingListData';
import LocationPin from '../../assets/icons/contact/location-pin.png'

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';


const BookingDetails = ({ route, navigation }: { route: any; navigation: any }) => {

    const { id } = route.params;
    const booking = personBooking.find(item => item.id === id);
    const [visible, setVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState([]);

    // Different photos
    const photos = [
        require('../../assets/services/HomeRepairANDMaintenance/carpentry.jpg'),
        require('../../assets/services/HomeRepairANDMaintenance/handyman.jpg'),
        require('../../assets/services/HomeRepairANDMaintenance/electrical.jpg'),
        require('../../assets/services/HomeRepairANDMaintenance/washing-machine-repair.jpg'),
        require('../../assets/services/HomeRepairANDMaintenance/flooring.jpg'),
    ];

    const openImage = (image:any) => {
        setSelectedImage(image);
        setVisible(true);
    };
    return (
        <View style={{ flex: 1 }}>
            <HeaderComponentAdmin style={styles.header} />

            <View style={styles.divider} />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>


                    {/* HEADER */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={leftArrowIcon} style={styles.backIcon} />
                            <Text style={styles.title}>Booking Details_1</Text>
                        </View>
                    </TouchableOpacity>


                    {/* BIG CARD */}
                    <View style={styles.card}>

                        <Text style={styles.heading}>{booking?.name}</Text>
                        <Text style={styles.bookingId}>Booking ID : {booking?.id}</Text>

                        <View style={styles.rowflex}>
                            <Text style={styles.labelFlex}>Service(s)</Text>
                            <Text style={styles.valueFlex}>{booking?.service}</Text>
                        </View>

                        <View style={styles.rowflex}>
                            <Text style={styles.labelFlex} >Budget</Text>
                            <Text style={[styles.valueFlex, { paddingLeft: hp('4%') }]}>{booking?.budget}</Text>
                        </View>

                        <View style={styles.rowLocation}>
                            <View style={styles.rowLocationInside}>

                                <Text style={styles.labelFlex}>Location</Text>
                                <Text style={[styles.value, { paddingLeft: hp('3%') }]}>{booking?.location}</Text>
                            </View>
                            <View >
                                <Image source={LocationPin} style={{ height: 20, width: 20 }} />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Booking Date & Time</Text>
                            <Text style={styles.value}>{booking?.date}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Service Starting Date & Time</Text>
                            <Text style={styles.value}>{booking?.date}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Service Ending Date & Time</Text>
                            <Text style={styles.value}>{booking?.date}</Text>
                        </View>

                        <View style={styles.rowflex}>
                            <Text style={styles.labelFlex}>Approx Days to complete</Text>
                            <Text style={styles.valueFlex}>10 Days</Text>
                        </View>





                        <View style={styles.row}>
                            <Text style={styles.label}>Special Request</Text>
                            <Text style={[styles.value, { paddingTop: hp('1%') }]}>{booking?.message}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Photos</Text>

                            <View style={styles.photos}>
                                {photos.map((image, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => openImage(image)}
                                    >
                                        <Image
                                            source={image}
                                            style={styles.photoItem}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Fullscreen Popup */}
                            <Modal
                                visible={visible}
                                transparent
                                animationType="fade"
                            >
                                <TouchableOpacity
                                    style={styles.modalContainer}
                                    activeOpacity={1}
                                    onPress={() => setVisible(false)}
                                >
                                    <Image
                                        source={selectedImage}
                                        style={styles.fullImage}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </Modal>
                        </View>

                        {/* ButtonContainer */}
                        <View style={styles.ButtonContainer}>
                            <TouchableOpacity style={styles.AcceptButton} onPress={() => {
                                navigation.navigate('BookingDetailsScreen_2', {
                                    id: booking?.id,
                                });
                            }}>
                                <Text style={styles.AcceptText}> Accept This Offer</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.RejectButton}>
                                <Text style={styles.RejectText}> Reject</Text>
                            </TouchableOpacity> */}

                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default BookingDetails;

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

    header: {
        marginTop: hp('2%'),
        paddingHorizontal: wp('4%'),
    },

    divider: {
        borderBottomWidth: 1,
        borderColor: '#CAD2DF',
        marginTop: 16,
    },

    /* BACK BUTTON */
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: hp('1%'),
        marginLeft: wp('3%'),
        position: 'absolute',
        top: hp('-1%'),
        left: hp('-1%'),
        zIndex: 999
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

    /* CARD */
    card: {
        width: wp('90%'),
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('5%'),
        elevation: 5,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        marginBottom: hp('1%')
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
        flex: 1
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
        marginBottom: hp('1%')
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
        paddingLeft: hp('1.5%')
    },

    /* STATUS */
    statusBox: {
        marginTop: hp('2%'),
        alignItems: 'center',
    },

    statusText: {
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('0.8%'),
        borderRadius: 30,
        fontWeight: '700',
        fontSize: hp('1.8%'),
        overflow: 'hidden',
    },

    completed: {
        backgroundColor: '#d1fae5',
        color: '#047857',
        width: '100%',
        textAlign: "center"
    },

    pending: {
        backgroundColor: '#fef3c7',
        color: '#b45309',
        width: '100%',
        textAlign: "center"
    },

    cancelled: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        width: '100%',
        textAlign: "center"
    },

    /* DROPDOWN */
    dropdownWrapper: {
        width: '100%',
        marginTop: hp('1.5%'),

        zIndex: 999,
    },

    dropdownBtn: {
        backgroundColor: '#fff',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'green',
    },

    dropdownText: {
        fontWeight: '600',
        color: '#555',
        fontSize: hp('1.8%'),
    },

    dropdownMenu: {
        backgroundColor: '#fff',
        marginTop: hp('1%'),
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        elevation: 5,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    dropdownItem: {
        paddingVertical: hp('1.8%'),
        paddingHorizontal: wp('4%'),
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },
    statusLabel: {
        fontSize: hp('2.3%'),
        marginTop: hp('2%'),
        fontWeight: '700',
        color: '#111',

    },
    ButtonContainer: {
        marginTop: hp('1%'),
        marginBottom: hp('6%'),
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: wp('3%'),
    },
    RejectButton: {
        flex: 1,
        paddingVertical: hp('1.3%'),
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        width: '100%',
        backgroundColor: '#ea0707',

        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0,0.1)',
        elevation: 2
    },
    RejectText: {
        fontSize: hp('1.7%'),
        fontWeight: '700',
        color: '#fff'
    },
    AcceptButton: {
        flex: 1,
        paddingVertical: hp('1%'),
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
        letterSpacing: 0.5
    },
    photos: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
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
});
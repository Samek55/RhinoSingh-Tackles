import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image
} from 'react-native';
import React from 'react';
import HeaderComponentAdmin from '../../../src/components/admin/HeaderComponentAdmin';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import leftArrowIcon from '../../assets/icons/admin/leftarrow.png';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

// Font scaling utility function
const scaleFont = (size: number) => {
    const guidelineBaseWidth = 375; // Base screen width to scale from
    return (size * width) / guidelineBaseWidth;
};

const PaymentDetails = ({ navigation }: { route: any; navigation: any }) => {


    return (
        <View style={styles.mainContainer}>
            <HeaderComponentAdmin style={styles.header} />
            <View style={{ borderBottomWidth: 1, borderColor: '#CAD2DF', marginTop: 16 }} />

            <View style={styles.container}>
                {/* HEADER */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={leftArrowIcon} style={styles.backIcon} />
                        <Text style={styles.title}>Payment Details</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.thankYouText}>
                    RocketSingh
                </Text>

                <View style={styles.detailsContainer}>

                    <Text style={styles.bookingText}>
                        Routing Number: 026009593
                    </Text>
                    <Text style={styles.bookingText}>
                        Account Number: 123456789012
                    </Text>
                    <Text style={styles.bookingText}>
                        Bank of America
                    </Text>
                    <Text style={styles.bookingText}>
                        California, USA
                    </Text>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '7%',
       // Adjust top padding based on screen size

    },
    thankYouText: {
        fontSize: scaleFont(27),
        fontWeight: '700',
        color: '#30704b',
         paddingTop: height * 0.06, 
    },
    detailsContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: hp('3%')

    },
    bookingText: {

        textAlign: 'center',
        // Adjust margin-bottom based on screen height
        fontSize: scaleFont(17),
        // Adjust top margin for large screens
        fontWeight: '500',
        lineHeight: 23,
        color: '#555'
    },

    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        marginTop: hp('2.0%'),
        paddingHorizontal: 15.7,
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
        zIndex: 9,
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

});

export default PaymentDetails;

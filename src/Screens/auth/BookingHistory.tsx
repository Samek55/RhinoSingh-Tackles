import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    FlatList
} from 'react-native';
import HeaderComponentAdmin from '../../components/admin/HeaderComponentAdmin';
import leftArrowIcon from '../../assets/icons/admin/leftarrow.png'
import SearchIcon from '../../assets/image/TabIcon/searchbar.png'

import { personBooking } from '../../data/AdminData/PersonBookingListData';

import BookingCard from '../../components/admin/BookingCard';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';


const BookingHistory = ({ navigation }: { navigation: any }) => {
    const [openId, setOpenId] = React.useState<number | null>(null);
    const [filter, setFilter] = React.useState('All');

    const toggleCard = (id: number) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    const filteredData = React.useMemo(() => {
        if (filter === 'All') return personBooking;

        return personBooking.filter(item =>
            item.status === filter
        );
    }, [filter]);

    return (
        <View style={{ flex: 1 }}>
            <HeaderComponentAdmin style={styles.header} />

            <View style={styles.divider} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={leftArrowIcon} style={styles.backBtn} />
                    <Text style={styles.title}>Booking History</Text>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Image source={SearchIcon} style={{ height: 20, width: 20, }} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={'rgba(67, 67, 67,0.8)'}
                        style={styles.textInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.mainBtns}>
                    <TouchableOpacity style={styles.btn} onPress={() => setFilter('All')}>
                        <Text style={styles.btnText}>All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={() => setFilter('Completed')}>
                        <Text style={styles.btnText}>Completed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={() => setFilter('Pending')}>
                        <Text style={styles.btnText}>Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={() => setFilter('Cancelled')}>
                        <Text style={styles.btnText}>Cancelled</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    style={styles.BookingCard}
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <BookingCard
                            item={item}
                            isOpen={openId === item.id}
                            onToggle={() => toggleCard(item.id)}
                            navigation={navigation}
            
                        />
                    )}
                    contentContainerStyle={{
                        paddingBottom: hp('15%'), // 👈 adds space at end of list
                    }}

                />


            </KeyboardAvoidingView>
        </View>
    );
};

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

export default BookingHistory;

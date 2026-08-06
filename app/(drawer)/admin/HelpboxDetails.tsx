import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

import leftArrowIcon from '../../../assets/icons/admin/leftarrow.png';
import dropdownIcon from '../../../assets/icons/contact/DropDown.png';
import LocationPin from '../../../assets/icons/contact/location-pin.png';
import phoneIcon from '../../../assets/icons/admin/phone.png';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router, useLocalSearchParams } from 'expo-router';
import Header5 from '@/components/Header5Admin';

// Updated API imports to track helpbox data instead of generic bookings
import { fetchHelpboxFromSupabase } from '@/api/supabase/fetchHelpboxSB';
import { updateHelpboxStatusSB } from '@/api/supabase/updateHelpboxStatusSB';

type StatusType = 'Completed' | 'Pending' | 'Cancelled';

export default function HelpboxDetails() {
    const scrollRef = useRef<ScrollView>(null);
    const { id } = useLocalSearchParams<{ id: string }>();

    const [helpboxData, setHelpboxData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [workStatus, setWorkStatus] = useState<StatusType>('Pending');

    const STATUS_OPTIONS: StatusType[] = ['Completed', 'Pending', 'Cancelled'];

    // Unified fetch logic entirely mapped to Supabase Helpbox table
    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await fetchHelpboxFromSupabase();
                const safeData = Array.isArray(data) ? data : [];
                const found = safeData.find((item: any) => item && String(item.id) === String(id));

                if (found) {
                    setHelpboxData(found);
                    if (found.status) {
                        setWorkStatus(found.status as StatusType);
                    }
                } else {
                    setHelpboxData(null);
                }
            } catch (error) {
                console.error("Error fetching helpbox details from Supabase:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const handleStatusChange = (newStatus: StatusType) => {
        setWorkStatus(newStatus);
        setOpenDropdown(false);
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            console.log("👉 ACTUAL OBJECT KEYS AVAILABLE:", Object.keys(helpboxData || {}));

            const trueDatabaseId = helpboxData?.id || helpboxData?.helpboxId;

            if (!trueDatabaseId) {
                alert("Could not extract a valid identifier from the object. Check console.");
                return;
            }

            console.log(`🔄 Sending true identifier to Supabase: ${trueDatabaseId}`);
            await updateHelpboxStatusSB(trueDatabaseId, workStatus);

            setHelpboxData((prev: any) => ({ ...prev, status: workStatus }));
            alert("Status updated successfully!");
            router.replace('/admin/HelpboxHistory'); // Or redirect to your helpbox index route

        } catch (error) {
            console.error('Failed to update status:', error);
            alert("An error occurred while updating status.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
            <Header5 />

            {/* FIXED TOP NAVIGATION HEADER */}
            <View style={styles.topNavigationHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Image source={leftArrowIcon} style={styles.backIcon} />
                    <Text style={styles.title}>
                        {helpboxData?.id ? `Helpbox ID: ${helpboxData.id}` : 'Helpbox Details'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scrollContent}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="green" />
                            <Text style={styles.loadingText}>Loading Details...</Text>
                        </View>
                    ) : helpboxData ? (
                        <View style={[styles.card, { marginBottom: hp('10%') }]}>
                            <Text style={styles.heading}>{helpboxData?.fullName || 'N/A'}</Text>

                            <Text style={styles.labelMain}>
                                <Image
                                    source={phoneIcon}
                                    style={{ width: 14, height: 11.5, tintColor: '#555' }}
                                />{' '}
                                {helpboxData?.phone || ''}
                            </Text>


                            <View style={styles.row}>

                                <Text style={styles.label}>Status</Text>
                                <Text
                                    style={[
                                        styles.value,
                                        helpboxData?.status?.includes('Completed') && styles.completed,
                                        helpboxData?.status?.includes('Pending') && styles.pending,
                                        helpboxData?.status?.includes('Cancelled') && styles.cancelled,
                                    ]}
                                >
                                    {helpboxData?.status || 'Pending'}
                                </Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Created Date & Time</Text>
                                <Text style={styles.value}>{helpboxData?.created_at || helpboxData?.bookingDate || 'N/A'}</Text>
                            </View>

                            <Text style={styles.statusLabel}>Work Status</Text>

                            {/* STATUS DROPDOWN CONTAINER WITH POSITIONING DEFENSES */}
                            <View style={[styles.dropdownWrapper, { zIndex: openDropdown ? 9999 : 1 }]}>
                                <TouchableOpacity
                                    style={styles.dropdownBtn}
                                    onPress={() => {
                                        setOpenDropdown(!openDropdown);
                                        setTimeout(() => {
                                            scrollRef.current?.scrollToEnd({ animated: true });
                                        }, 100);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.dropdownTextContainer}>{workStatus}</Text>
                                        <Image
                                            source={dropdownIcon}
                                            style={{ height: 20, width: 23, tintColor: 'green' }}
                                        />
                                    </View>
                                </TouchableOpacity>

                                {openDropdown && (
                                    <View style={styles.dropdownMenu}>
                                        {STATUS_OPTIONS.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={styles.dropdownItem}
                                                onPress={() => handleStatusChange(item)}
                                            >
                                                <Text style={styles.dropdownTextInside}>{item}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* ButtonContainer */}
                            <View style={styles.ButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.AcceptButton, submitting && { backgroundColor: '#ccc' }]}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.AcceptText}>Submit</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>No details available.</Text>
                        </View>
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
        width: wp('100%'),
        backgroundColor: '#f6f7fb',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        flexDirection: 'row',
        alignItems: 'center',
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
        paddingTop: hp('2%'),
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
    row: {
        marginBottom: hp('1.8%'),
        paddingBottom: hp('1%'),
    },
    rowLocationInside: {
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
    labelMain: {
        fontSize: hp('1.7%'),
        fontWeight: '700',
        color: '#555',
        marginBottom: hp('2%'),
        marginTop: hp('1.2%'),
        letterSpacing: 0.5,
    },
    value: {
        fontSize: hp('1.8%'),
        fontWeight: '500',
        color: '#555',
        lineHeight: hp('2.3%'),
    },
    completed: {
        color: 'green',
        fontWeight: '700',
    },
    pending: {
        color: '#E8A317',
        fontWeight: '700',
    },
    cancelled: {
        color: 'red',
        fontWeight: '700',
    },
    dropdownWrapper: {
        width: '100%',
        marginTop: hp('1.5%'),
        position: 'relative',
    },
    dropdownBtn: {
        backgroundColor: '#fff',
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'green',
    },
    dropdownTextContainer: {
        fontWeight: '600',
        color: '#555',
        fontSize: hp('1.7%'),
    },
    dropdownTextInside: {
        fontWeight: '600',
        color: '#555',
        fontSize: hp('1.5%'),
    },
    dropdownMenu: {
        position: 'absolute',
        top: hp('5.5%'),
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        zIndex: 99999,
    },
    dropdownItem: {
        paddingVertical: hp('1.8%'),
        paddingHorizontal: wp('4%'),
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    statusLabel: {
        fontSize: hp('2.3%'),
        marginTop: hp('3%'),
        fontWeight: '700',
        color: '#111',
    },
    ButtonContainer: {
        marginTop: hp('4%'),
        marginBottom: hp('1%'),
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
        fontSize: hp('1.8%'),
        fontWeight: '500',
        color: '#fff',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        marginTop: hp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: hp('2%'),
        fontSize: hp('2%'),
        color: '#555',
    },
});
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
    FlatList
} from 'react-native';

import SearchIcon from '../../../assets/images/TabIcon/searchbar.png';
import HelpboxCard, { BookingItem } from '../../../components/admin/HelpboxCard';
import Header4 from '@/components/Header4Admin';
import { router, useFocusEffect } from 'expo-router';
import { fetchHelpboxFromSupabase } from '@/api/supabase/fetchHelpboxSB';

import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useRequireRole } from '@/hooks/useRequireRole';

export default function HelpboxHistory() {
    const { authorized } = useRequireRole(['admin', 'superadmin']);
    const [helpboxItems, setHelpboxItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const lastDataRef = useRef<string>('');

    const loadHelpboxData = useCallback(async () => {
        try {
            const data = await fetchHelpboxFromSupabase();
            

            const safeData = Array.isArray(data) ? data : [];
            const serialized = JSON.stringify(safeData);

            if (serialized === lastDataRef.current) {
                return;
            }

            lastDataRef.current = serialized;
            setHelpboxItems(safeData);
        } catch (error) {
            console.error('DEBUG ERROR: Failed to load helpbox entries:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadHelpboxData();

            const intervalId = setInterval(() => {
                loadHelpboxData();
            }, 15000);

            return () => clearInterval(intervalId);
        }, [loadHelpboxData])
    );

    const toggleCard = useCallback((id: string) => {
        setOpenId(prev => (prev === id ? null : id));
    }, []);

    const handlePress = useCallback((id: string) => {
        const selectedItem = helpboxItems.find(b => b.id === id);
        const currentStatus = selectedItem?.status?.toLowerCase()?.trim() || '';

   

        router.push({
            pathname: '/admin/HelpboxDetails',
            params: { id },
        });
    }, [helpboxItems]);

    const filteredData = useMemo(() => {
        let data = [...helpboxItems];

        if (filter !== 'All') {
            data = data.filter(item => {
                const status = (item?.status || '').toLowerCase().trim();
                if (filter === 'Cancelled') return status.includes('cancel');
                if (filter === 'New / Open') return status.includes('new') || status.includes('open');
                return status.includes(filter.toLowerCase());
            });
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            data = data.filter(item => {
                if (!item) return false;
                const uin = String(item.helpbox_uin || '').toLowerCase();
                const phoneNumber = String(item.phone || '').toLowerCase();

                return uin.includes(query) || phoneNumber.includes(query);
            });
        }

        data.sort((a, b) => {
            const timeA = a.rawBookingDate ? new Date(a.rawBookingDate).getTime() : 0;
            const timeB = b.rawBookingDate ? new Date(b.rawBookingDate).getTime() : 0;
            return timeB - timeA;
        });

        return data;
    }, [filter, searchQuery, helpboxItems]);

    const renderItem = useCallback(({ item, index }: any) => {
        // Crucial logic verification log
        if (!item || !item.id) {
            return null;
        }
        
        return (
            <HelpboxCard
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggleCard(item.id)}
                onPress={() => handlePress(item.id)}
            />
        );
    }, [openId, toggleCard, handlePress]);

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
                    <Text style={styles.title}>Helpbox History ({filteredData.length})</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Image source={SearchIcon} style={{ height: 20, width: 20 }} />
                    <TextInput
                        placeholder="Search phone or UIN..."
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

                {loading ? (
                    <Text style={{ alignSelf: 'center', marginTop: 20 }}>Loading records...</Text>
                ) : filteredData.length === 0 ? (
                    <Text style={{ alignSelf: 'center', marginTop: 20, color: 'gray' }}>No records to display.</Text>
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.helpbox_uin}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
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
    inputContainer: { flexDirection: 'row', paddingHorizontal: hp('2%'), borderWidth: 1.5, width: '90%', marginBottom: '5%', borderRadius: 200, borderColor: 'rgba(0, 0, 0,0.3)', height: hp('5%'), marginTop: hp('2%'), alignItems: 'center', alignSelf: 'center' },
    textInput: { flex: 1, fontSize: hp(1.8), fontWeight: '500', color: '#000', paddingLeft: 8, letterSpacing: 0.3 },
    mainBtns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: wp('4%'), paddingBottom: hp('3%') },
    btn: { backgroundColor: '#d7edd7', paddingHorizontal: wp('4%'), paddingVertical: hp('0.8%'), borderRadius: 20, alignItems: 'center', marginRight: wp('2%'), marginBottom: hp('1.5%') },
    activeBtn: { backgroundColor: '#b3dbb3' },
    btnText: { fontSize: wp('3.4%'), fontWeight: '500', color: 'rgba(0,0,0,0.7)' }
});
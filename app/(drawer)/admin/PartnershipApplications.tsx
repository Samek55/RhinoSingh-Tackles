import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    Modal,
    ScrollView,
    Linking,
} from 'react-native';
import SearchIcon from '../../../assets/images/TabIcon/searchbar.png';
import Header4 from '@/components/Header4Admin';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useRequireRole } from '@/hooks/useRequireRole';
import { fetchPartnershipFromSupabase } from '@/api/supabase/fetchPartnershipSB';

export default function PartnershipApplications() {
    const { authorized } = useRequireRole(['admin', 'superadmin']);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState<any>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await fetchPartnershipFromSupabase();
            setApplications(data);
            setLoading(false);
        })();
    }, []);

    const filteredData = useMemo(() => {
        if (searchQuery.trim() === '') return applications;
        const query = searchQuery.toLowerCase().trim();
        return applications.filter((item) =>
            String(item.fullName).toLowerCase().includes(query) ||
            String(item.organisationName).toLowerCase().includes(query) ||
            String(item.phoneNumber).toLowerCase().includes(query)
        );
    }, [applications, searchQuery]);

    const renderItem = useCallback(({ item }: any) => (
        <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <Text style={styles.cardTitle}>{item.organisationName}</Text>
            <Text style={styles.cardSubtitle}>{item.fullName} · {item.city}</Text>
            <Text style={styles.cardPhone}>{item.phoneNumber}</Text>
        </TouchableOpacity>
    ), []);

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
                    <Text style={styles.title}>Partnership Applications ({filteredData.length})</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Image source={SearchIcon} style={{ height: 20, width: 20 }} />
                    <TextInput
                        placeholder="Search name, company or phone..."
                        placeholderTextColor="rgba(67, 67, 67,0.8)"
                        style={styles.textInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                    />
                </View>

                {loading ? (
                    <Text style={{ alignSelf: 'center', marginTop: 20 }}>Loading applications...</Text>
                ) : filteredData.length === 0 ? (
                    <Text style={{ alignSelf: 'center', marginTop: 20, color: 'gray' }}>No applications to display.</Text>
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

            <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selected && (
                                <>
                                    <Text style={styles.detailTitle}>{selected.organisationName}</Text>
                                    <DetailRow label="Contact Person" value={selected.fullName} />
                                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${selected.phoneNumber}`)}>
                                        <DetailRow label="Phone" value={selected.phoneNumber} valueStyle={{ color: '#064E3B', textDecorationLine: 'underline' }} />
                                    </TouchableOpacity>
                                    <DetailRow label="Email" value={selected.email} />
                                    <DetailRow label="City" value={selected.city} />
                                    <DetailRow label="Employees" value={selected.numberOfEmployees} />
                                    <DetailRow label="Business Type" value={selected.businessType} />
                                    <DetailRow label="Services Offered" value={(selected.servicesOffered || []).join(', ') || 'N/A'} />
                                    <DetailRow label="Partnership Interests" value={selected.partnershipInterests} />
                                    <DetailRow label="How They Heard About Us" value={selected.howDidYouHear} />
                                    <DetailRow label="Message" value={selected.message || 'N/A'} />

                                    {selected.companyPhotos?.length > 0 && (
                                        <>
                                            <Text style={styles.sectionLabel}>Company Photos</Text>
                                            {selected.companyPhotos.map((url: string, i: number) => (
                                                <TouchableOpacity key={i} onPress={() => Linking.openURL(url)}>
                                                    <Text style={styles.linkText}>Photo {i + 1}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )}

                                    {selected.companyRegistrationCertificates?.length > 0 && (
                                        <>
                                            <Text style={styles.sectionLabel}>Registration Certificates</Text>
                                            {selected.companyRegistrationCertificates.map((url: string, i: number) => (
                                                <TouchableOpacity key={i} onPress={() => Linking.openURL(url)}>
                                                    <Text style={styles.linkText}>Certificate {i + 1}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setSelected(null)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function DetailRow({ label, value, valueStyle }: { label: string; value: string; valueStyle?: object }) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp('4%'), marginTop: hp('1.5%'), height: hp('5%') },
    title: { fontSize: hp('2.3%'), fontWeight: '600', color: 'green', marginLeft: wp('2%') },
    inputContainer: { flexDirection: 'row', paddingHorizontal: hp('2%'), borderWidth: 1.5, width: '90%', marginBottom: '5%', borderRadius: 200, borderColor: 'rgba(0, 0, 0,0.3)', height: hp('5%'), marginTop: hp('2%'), alignItems: 'center', alignSelf: 'center' },
    textInput: { flex: 1, fontSize: hp(1.8), fontWeight: '500', color: '#000', paddingLeft: 8, letterSpacing: 0.3 },
    card: {
        backgroundColor: '#f6f7fb',
        borderRadius: 14,
        padding: wp('4%'),
        marginBottom: hp('1.5%'),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    cardTitle: { fontSize: hp('2%'), fontWeight: '700', color: '#1a1a2e' },
    cardSubtitle: { fontSize: hp('1.6%'), color: '#555', marginTop: 4 },
    cardPhone: { fontSize: hp('1.6%'), color: '#064E3B', marginTop: 4, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: wp('5%'),
        maxHeight: '85%',
    },
    detailTitle: { fontSize: hp('2.5%'), fontWeight: '800', color: '#1a1a2e', marginBottom: hp('2%') },
    detailRow: { marginBottom: hp('1.5%') },
    detailLabel: { fontSize: hp('1.5%'), fontWeight: '700', color: '#666' },
    detailValue: { fontSize: hp('1.8%'), color: '#1a1a2e', marginTop: 2 },
    sectionLabel: { fontSize: hp('1.7%'), fontWeight: '700', color: '#1a1a2e', marginTop: hp('1%'), marginBottom: hp('0.5%') },
    linkText: { fontSize: hp('1.7%'), color: '#064E3B', textDecorationLine: 'underline', marginBottom: 4 },
    closeButton: {
        marginTop: hp('2%'),
        backgroundColor: '#064E3B',
        borderRadius: 50,
        paddingVertical: hp('1.5%'),
        alignItems: 'center',
    },
    closeButtonText: { color: '#fff', fontWeight: '700', fontSize: hp('1.7%') },
});

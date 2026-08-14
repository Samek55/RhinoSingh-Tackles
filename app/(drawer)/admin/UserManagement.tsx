import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
} from 'react-native';
import Header4 from '@/components/Header4Admin';
import { router } from 'expo-router';
import { useRequireSuperAdmin } from '@/hooks/useRequireSuperAdmin';
import { invokeEdgeFunction } from '@/api/adminFunctionsClient';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type Tab = 'Professionals' | 'Customers' | 'Admins';

export default function UserManagement() {
    const authorized = useRequireSuperAdmin();
    const [tab, setTab] = useState<Tab>('Professionals');
    const [loading, setLoading] = useState(true);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);

    const loadTab = useCallback(async (activeTab: Tab) => {
        setLoading(true);
        try {
            if (activeTab === 'Professionals') {
                const data = await invokeEdgeFunction<any>('list-professionals', {}, 'Could not load professionals', { requireSession: true });
                setProfessionals(data?.professionals ?? []);
            } else if (activeTab === 'Customers') {
                const data = await invokeEdgeFunction<any>('list-customers', {}, 'Could not load customers', { requireSession: true });
                setCustomers(data?.customers ?? []);
            } else {
                const data = await invokeEdgeFunction<any>('list-staff', {}, 'Could not load staff', { requireSession: true });
                setStaff(data?.staff ?? []);
            }
        } catch (error) {
            console.error('UserManagement load failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authorized) loadTab(tab);
    }, [authorized, tab, loadTab]);

    const handleApprove = async (professionalId: number) => {
        const data = await invokeEdgeFunction<any>('approve-professional', { professionalId }, 'Could not approve professional', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.error || 'Could not approve professional');
            return;
        }
        loadTab('Professionals');
    };

    const handleReject = async (professionalId: number) => {
        const data = await invokeEdgeFunction<any>('reject-professional', { professionalId }, 'Could not reject professional', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.error || 'Could not reject professional');
            return;
        }
        loadTab('Professionals');
    };

    const handleToggleProfessionalStatus = async (professionalId: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        const data = await invokeEdgeFunction<any>('toggle-professional-status', { professionalId, status: nextStatus }, 'Could not update status', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.error || 'Could not update status');
            return;
        }
        loadTab('Professionals');
    };

    const handleToggleCustomerBlock = async (phone: string, blocked: boolean) => {
        const data = await invokeEdgeFunction<any>('toggle-customer-block', { phone, blocked: !blocked }, 'Could not update block status', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.error || 'Could not update block status');
            return;
        }
        loadTab('Customers');
    };

    const handleChangeStaffRole = async (id: number, role: string) => {
        const roles = ['career', 'admin', 'superadmin'];
        const nextRole = roles[(roles.indexOf(role) + 1) % roles.length];
        const data = await invokeEdgeFunction<any>('update-staff-role', { id, role: nextRole }, 'Could not update role', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.error || 'Could not update role');
            return;
        }
        loadTab('Admins');
    };

    const handleApproveAdmin = async (adminId: number) => {
        const data = await invokeEdgeFunction<any>('approve-admin', { adminId }, 'Could not approve account', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.message || 'Could not approve account');
            return;
        }
        loadTab('Admins');
    };

    const handleRejectAdmin = async (adminId: number) => {
        const data = await invokeEdgeFunction<any>('reject-admin', { adminId }, 'Could not reject account', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.message || 'Could not reject account');
            return;
        }
        loadTab('Admins');
    };

    const handleToggleAdminStatus = async (id: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const data = await invokeEdgeFunction<any>('toggle-admin-status', { id, status: nextStatus }, 'Could not update status', { requireSession: true });
        if (!data?.success) {
            Alert.alert('Error', data?.message || 'Could not update status');
            return;
        }
        loadTab('Admins');
    };

    if (!authorized) {
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header4 />
            <View style={styles.container}>
                <Text style={styles.title}>User Management</Text>

                <View style={styles.tabRow}>
                    {(['Professionals', 'Customers', 'Admins'] as Tab[]).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                            onPress={() => setTab(t)}
                        >
                            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <Text style={styles.emptyText}>Loading...</Text>
                ) : tab === 'Professionals' ? (
                    <FlatList
                        data={professionals}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No professionals yet.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{item.fullName}</Text>
                                <Text style={styles.cardSubtitle}>{item.phone} · {item.status}</Text>
                                {item.preferredWorkingArea ? (
                                    <Text style={styles.cardSubtitle}>{item.preferredWorkingArea}</Text>
                                ) : null}
                                <View style={styles.cardActions}>
                                    {item.status === 'Pending' && (
                                        <>
                                            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                                                <Text style={styles.actionText}>Approve</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                                                <Text style={styles.actionText}>Reject</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    {(item.status === 'Active' || item.status === 'Suspended') && (
                                        <TouchableOpacity
                                            style={item.status === 'Active' ? styles.rejectBtn : styles.approveBtn}
                                            onPress={() => handleToggleProfessionalStatus(item.id, item.status)}
                                        >
                                            <Text style={styles.actionText}>{item.status === 'Active' ? 'Suspend' : 'Reactivate'}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    />
                ) : tab === 'Customers' ? (
                    <FlatList
                        data={customers}
                        keyExtractor={(item) => item.phone}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No customers yet.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{item.full_name || 'N/A'}</Text>
                                <Text style={styles.cardSubtitle}>{item.phone}</Text>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={item.blocked ? styles.approveBtn : styles.rejectBtn}
                                        onPress={() => handleToggleCustomerBlock(item.phone, item.blocked)}
                                    >
                                        <Text style={styles.actionText}>{item.blocked ? 'Unblock' : 'Block'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                ) : (
                    <>
                        <FlatList
                            data={staff}
                            keyExtractor={(item) => String(item.id)}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={<Text style={styles.emptyText}>No staff accounts found.</Text>}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>{item.full_name}</Text>
                                    <Text style={styles.cardSubtitle}>{item.phone} · Role: {item.role} · {item.status}</Text>
                                    <View style={styles.cardActions}>
                                        {item.status === 'Pending' && (
                                            <>
                                                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveAdmin(item.id)}>
                                                    <Text style={styles.actionText}>Approve</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectAdmin(item.id)}>
                                                    <Text style={styles.actionText}>Reject</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        {(item.status === 'Active' || item.status === 'Inactive') && (
                                            <>
                                                <TouchableOpacity style={styles.approveBtn} onPress={() => handleChangeStaffRole(item.id, item.role)}>
                                                    <Text style={styles.actionText}>Change Role</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={item.status === 'Active' ? styles.rejectBtn : styles.approveBtn}
                                                    onPress={() => handleToggleAdminStatus(item.id, item.status)}
                                                >
                                                    <Text style={styles.actionText}>{item.status === 'Active' ? 'Deactivate' : 'Reactivate'}</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            )}
                        />
                        <TouchableOpacity style={styles.createAccountBtn} onPress={() => router.push('/AdminCreate' as any)}>
                            <Text style={styles.createAccountText}>+ Create New Staff Account</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp('4%') },
    title: { fontSize: hp('2.3%'), fontWeight: '600', color: 'green', marginTop: hp('1.5%'), marginBottom: hp('1.5%') },
    tabRow: { flexDirection: 'row', marginBottom: hp('2%') },
    tabBtn: { flex: 1, paddingVertical: hp('1.2%'), alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 10, marginRight: wp('2%') },
    tabBtnActive: { backgroundColor: '#064E3B' },
    tabText: { fontWeight: '600', color: '#333' },
    tabTextActive: { color: '#fff' },
    listContent: { paddingBottom: hp('10%') },
    emptyText: { alignSelf: 'center', marginTop: 20, color: 'gray' },
    card: {
        backgroundColor: '#f6f7fb',
        borderRadius: 14,
        padding: wp('4%'),
        marginBottom: hp('1.5%'),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    cardTitle: { fontSize: hp('2%'), fontWeight: '700', color: '#1a1a2e' },
    cardSubtitle: { fontSize: hp('1.6%'), color: '#555', marginTop: 2 },
    cardActions: { flexDirection: 'row', marginTop: hp('1%'), gap: wp('2%') },
    approveBtn: { backgroundColor: '#064E3B', paddingHorizontal: wp('3%'), paddingVertical: hp('0.8%'), borderRadius: 8 },
    rejectBtn: { backgroundColor: '#b00020', paddingHorizontal: wp('3%'), paddingVertical: hp('0.8%'), borderRadius: 8 },
    actionText: { color: '#fff', fontWeight: '600', fontSize: hp('1.5%') },
    createAccountBtn: { backgroundColor: '#064E3B', borderRadius: 50, paddingVertical: hp('1.5%'), alignItems: 'center', marginBottom: hp('2%') },
    createAccountText: { color: '#fff', fontWeight: '700' },
});

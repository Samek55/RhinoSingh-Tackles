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
  FlatList,
  ActivityIndicator,
} from 'react-native';

import SearchIcon from '../../../assets/images/TabIcon/searchbar.png';
import ProfessionalCard from '../../../components/admin/ProfessionalCard'; 
import Header4 from '@/components/Header4Admin';
import { router, useFocusEffect } from 'expo-router';

import { fetchWorkforceFromSupabase } from '@/api/supabase/fetchWorkforceSB'; 

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useRequireRole } from '@/hooks/useRequireRole';

export default function ProfessionalHistory() {
  const { authorized } = useRequireRole(['superadmin']);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rawCount, setRawCount] = useState<number>(0);

  const lastDataRef = useRef<string>('');

  const loadWorkforce = useCallback(async () => {
    try {
      const data = await fetchWorkforceFromSupabase();
      
      if (!data) {
        setApplications([]);
        return;
      }
      
      const safeData = Array.isArray(data) ? data : [];
      setRawCount(safeData.length);
      
      const serialized = JSON.stringify(safeData);
      if (serialized === lastDataRef.current) return;

      lastDataRef.current = serialized;
      setApplications(safeData);
    } catch (error: any) {
      console.error('Failed to load workforce details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadWorkforce();

      const intervalId = setInterval(() => {
        loadWorkforce();
      }, 15000);

      return () => clearInterval(intervalId);
    }, [loadWorkforce])
  );

  const toggleCard = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const handlePress = useCallback((id: string) => {
    router.push({
      pathname: '/admin/ProfessionalDetails', 
      params: { id },
    });
  }, []);

  const filteredData = useMemo(() => {
    let data = [...applications];

    // 1. Status Filter - Updated to include 'Pending-Update'
    if (filter !== 'All') {
      data = data.filter((item) => {
        const status = (item?.status || '').toLowerCase().trim();
        // Handle 'Pending-Update' specifically
        if (filter === 'Pending-Update') {
          return status === 'pending-update' || status === 'pending update';
        }
        return status.includes(filter.toLowerCase().trim());
      });
    }

    // 2. Search Filter (Fixed name matching behavior)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      data = data.filter((item) => {
        if (!item) return false;
        
        const idMatch = String(item.id || '').toLowerCase().includes(query);
        const uinMatch = String(item.workforce_uin || '').toLowerCase().includes(query);
        const nameMatch = String(item.fullName || '').toLowerCase().trim().includes(query);
        const phoneMatch = String(item.phone || '').toLowerCase().includes(query);
        const emailMatch = String(item.email || '').toLowerCase().includes(query);
        const statusMatch = String(item.status || '').toLowerCase().includes(query);

        return idMatch || uinMatch || nameMatch || phoneMatch || emailMatch || statusMatch;
      });
    }

    // 3. Sorting by latest workforce_uin (Descending order)
    data.sort((a, b) => {
      const uinA = String(a?.workforce_uin || a?.id || '');
      const uinB = String(b?.workforce_uin || b?.id || '');
      return uinB.localeCompare(uinA, undefined, { numeric: true, sensitivity: 'base' });
    });

    return data;
  }, [filter, searchQuery, applications]);

  const renderItem = useCallback(
    ({ item }: any) => {
      if (!item || !item.id) return null;
      return (
        <ProfessionalCard
          item={item}
          isOpen={openId === item.id}
          onToggle={() => toggleCard(item.id)}
          onPress={() => handlePress(item.id)}
        />
      );
    },
    [openId, toggleCard, handlePress]
  );

  if (!authorized) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header4 />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Title displaying total active application count dynamically */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Professional History ({filteredData.length})</Text>
        </View>

        <View style={styles.inputContainer}>
          <Image source={SearchIcon} style={{ height: 20, width: 20 }} />
          <TextInput
            placeholder="Search Application, UIN, or Status"
            placeholderTextColor={'rgba(67, 67, 67,0.8)'}
            style={styles.textInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.mainBtns}>
          {['All', 'Pending', 'Accepted', 'Rejected', 'Pending-Update'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.btn, 
                filter === f && styles.activeBtn,
                f === 'Pending-Update' && styles.pendingUpdateBtn
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.btnText,
                f === 'Pending-Update' && styles.pendingUpdateBtnText
              ]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && applications.length === 0 ? (
          <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp('15%') }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matching applications found.</Text>
                {rawCount > 0 && (
                  <Text style={styles.subEmptyText}>
                    Tip: You have {rawCount} records overall, but your active filter ("{filter}") or search term might be hiding them.
                  </Text>
                )}
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    marginTop: hp('1.5%'),
    height: hp('5%'),
  },
  title: { fontSize: hp('2.3%'), fontWeight: '600', color: 'green', marginLeft: wp('2%') },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: hp('2%'),
    borderWidth: 1.5,
    width: '90%',
    marginBottom: '5%',
    borderRadius: 200,
    borderColor: 'rgba(0, 0, 0,0.3)',
    height: hp('5%'),
    marginTop: hp('2%'),
    alignItems: 'center',
    alignSelf: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: hp(1.8),
    fontWeight: '500',
    color: '#000',
    paddingLeft: 8,
  },
  mainBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('3%'),
  },
  btn: {
    backgroundColor: '#d7edd7',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 20,
    alignItems: 'center',
    marginRight: wp('2%'),
    marginBottom: hp('1.5%'),
  },
  activeBtn: { backgroundColor: '#b3dbb3' },
  pendingUpdateBtn: { 
    backgroundColor: '#FFE4B5', // Light orange color for pending-update
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  pendingUpdateBtnText: {
    color: '#D2691E', // Dark orange text
    fontWeight: '600',
  },
  btnText: { fontSize: wp('3.4%'), fontWeight: '500', color: 'rgba(0,0,0,0.7)' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { color: '#666', fontSize: 16, fontWeight: '500' },
  subEmptyText: { color: '#888', fontSize: 13, marginTop: 8, textAlign: 'center' },
});
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import ServicesCards from '../../../components/services/ServicesCards';
import ServicesDisplaycard from '../../../components/services/ServicesDisplaycard';
import Header2 from '@/components/Header2';
import { servicesData2 } from '../../../src/data/ServiceData';
import Ionicons from '@expo/vector-icons/Ionicons';


// --- Helper Components ---

// Improved StableSearchBar with local state management
const StableSearchBar = React.memo(({ searchQuery, handleSearch }: any) => {
  const [localText, setLocalText] = useState(searchQuery);

  // Update local state when prop changes (for external updates)
  useEffect(() => {
    setLocalText(searchQuery);
  }, [searchQuery]);

  const handleChangeText = useCallback((text: string) => {
    setLocalText(text);
    handleSearch(text);
  }, [handleSearch]);

  return (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search "Plumbing"'
          placeholderTextColor="#888"
          value={localText}
          onChangeText={handleChangeText}
          clearButtonMode="while-editing"
        />
        <Ionicons name="search" size={28} color='#064E3B' style={styles.searchIcon} />

      </View>
    </View>
  );
});

// --- Logic ---

const topServices = servicesData2.filter(item => item.id === 1 || item.id === 4);

type ServiceItem = typeof servicesData2[0];
type RowItem =
  | { type: 'pair'; items: ServiceItem[]; key: string }
  | { type: 'featured'; item: ServiceItem; key: string };

const PAIRS_BEFORE_FEATURED = 3;

function buildRows(services: ServiceItem[]): RowItem[] {
  const rows: RowItem[] = [];
  let i = 0;
  let pairCount = 0;
  while (i < services.length) {
    if (pairCount === PAIRS_BEFORE_FEATURED && i < services.length) {
      rows.push({ type: 'featured', item: services[i], key: `featured-${services[i].id}` });
      i++;
      pairCount = 0;
    } else {
      const pair: ServiceItem[] = [services[i]];
      if (i + 1 < services.length) pair.push(services[i + 1]);
      rows.push({ type: 'pair', items: pair, key: `pair-${pair.map(p => p.id).join('-')}` });
      i += pair.length;
      pairCount++;
    }
  }
  return rows;
}

export default function ServiceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState(servicesData2);

  // Memoize filtered results
  const rows = useMemo(() => {
    const trending = searchQuery.trim() === ''
      ? filteredServices.filter(item => item.id !== 1 && item.id !== 4)
      : filteredServices;
    return buildRows(trending);
  }, [filteredServices, searchQuery]);

  // Memoize search handler
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredServices(servicesData2);
    } else {
      const lowerText = text.toLowerCase();
      setFilteredServices(servicesData2.filter(item =>
        item.name.toLowerCase().includes(lowerText)
      ));
    }
  }, []);

  // Memoize renderItem
  const renderItem = useCallback(({ item }: { item: RowItem }) => {
    if (item.type === 'featured') {
      return (
        <TouchableOpacity
          style={styles.featuredContainer}
          activeOpacity={0.88}
          onPress={() => router.push({
            pathname: '/service/ServiceDetail',
            params: { id: item.item.id.toString() }
          })}
        >
          <Image source={item.item.image} style={styles.featuredImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(18,46,44,0.90)']}
            style={styles.featuredGradient}
          >
            <Text style={styles.featuredLabel}>RocketSingh</Text>
            <Text style={styles.featuredName}>{item.item.name}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }


    return (
      <View style={styles.pairRow}>
        {item.items.map((s) => (
          <View key={s.id} style={styles.serviceItemContainer}>
            <ServicesDisplaycard
              id={s.id}
              name={s.name}
              words={s.words}
              image={s.image}
              onPress={() => router.push({
                pathname: '/service/ServiceDetail',
                params: { id: s.id.toString() }
              })}
            />
          </View>
        ))}
        {item.items.length === 1 && <View style={styles.serviceItemContainer} />}
      </View>
    );
  }, []);

  // Memoize search bar component
  const searchBar = useMemo(() => (
    <StableSearchBar searchQuery={searchQuery} handleSearch={handleSearch} />
  ), [searchQuery, handleSearch]);

  // Memoize top services rendering
  const topServicesList = useMemo(() => (
    <View style={styles.topServicesWrapper}>
      {topServices.map((item) => (
        <ServicesCards
          key={item.id}
          name={item.name}
          description={item.description}
          image={item.image}
          question={item.question}
          answer={item.answer}
          onPress={() => router.push({
            pathname: '/service/ServiceDetail',
            params: { id: item.id.toString() }
          })}
        />
      ))}
    </View>
  ), []);

  // Memoize the header component
  const ListHeader = useMemo(() => (
    <View>
      <ImageBackground
        source={require('../../../assets/services/bannerServices.jpg')}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'rgba(18,46,44,0.97)']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>SuperFast Services</Text>
          <Text style={styles.headerSubtitle}>On Demand Home Service in Chennai</Text>
        </LinearGradient>
      </ImageBackground>

      {/* Stable Search Bar */}
      {searchBar}

      {searchQuery.trim() === '' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle1}>Top Services</Text>
          {topServicesList}
          <Text style={styles.sectionTitle2}>Trending Services</Text>
        </View>
      )}
    </View>
  ), [searchBar, searchQuery, topServicesList]);

  const Separator = ({ index }: { index: number }) => {
    // Don't add separator after the header or between certain items
    if (index === 0) return null;
    return <View style={styles.rowSeparator} />;
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Header2 />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: wp('100%'),
    height: hp('28%'),
    overflow: 'hidden'
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    justifyContent: 'flex-end',
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2.5%'),
    gap: 4
  },
  headerTitle: {
    fontSize: wp('6.8%'),
    fontWeight: '800',
    color: '#fff'
  },
  headerSubtitle: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)'
  },
  searchSection: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'hsl(0, 0%, 95%)',
    borderRadius: 13,
    paddingHorizontal: wp('3%'),
    height: hp('5.5%'),
    borderWidth: 1,
    borderColor: '#ddd'
  },
  searchIcon: {
    fontSize: wp('6.5%'),
    marginRight: wp('1%'),

  },
  searchInput: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#333',
    height: '100%',
    paddingHorizontal: wp('3%'),
    letterSpacing: 0.7,
  },
  sectionContainer: {
    paddingHorizontal: wp('4%'),
  },
  sectionTitle1: {
    fontSize: wp('4.6%'),
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: hp('2%'),
  },
  sectionTitle2: {
    fontSize: wp('4.6%'),
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: hp('2.5%'),
    marginTop: hp('-2%')
  },
  listContent: {
    paddingBottom: hp('4%')
  },
  rowSeparator: {
    height: hp('4%')
  },
  pairRow: {
    flexDirection: 'row',
    paddingHorizontal: wp('4%'),
    justifyContent: 'space-between'
  },
  serviceItemContainer: {
    width: wp('43.5%')
  },
  featuredContainer: {
    marginVertical: hp('1.5%'),
    marginHorizontal: wp('4%'),
    borderRadius: 16,
    overflow: 'hidden',
    height: hp('22%'),
    elevation: 4
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  featuredGradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  featuredLabel: {
    fontSize: wp('3%'),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase'
  },
  featuredName: {
    fontSize: wp('5.2%'),
    fontWeight: '800',
    color: '#fff',
    marginTop: 4
  },
  topServicesWrapper: {
    width: '100%',
    paddingVertical: hp('1%'),
  },
});
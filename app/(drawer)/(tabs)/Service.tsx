import React, { useMemo, useCallback } from 'react';
import {
  View,
  ImageBackground,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ServicesCards from '../../../components/services/ServicesCards';
import ServicesDisplaycard from '../../../components/services/ServicesDisplaycard';
import { servicesData2 } from '../../../src/data/ServiceData';

const topServices = servicesData2.filter(item => item.id === 1 || item.id === 4);

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import { router } from 'expo-router';
import Header2 from '@/components/Header2';

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
  const rows = useMemo(() => {
    const trending = servicesData2.filter(item => item.id !== 1 && item.id !== 4);
    return buildRows(trending);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: RowItem }) => {
      if (item.type === 'featured') {
        return (
          <TouchableOpacity
            style={styles.featuredContainer}
            activeOpacity={0.88}
            onPress={() =>
              router.push({
                pathname: '/service/ServiceDetail',
                params: { id: item.item.id.toString() },
              })
            }
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
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: { id: s.id.toString() },
                  })
                }
              />
            </View>
          ))}
          {item.items.length === 1 && <View style={styles.serviceItemContainer} />}
        </View>
      );
    },
    []
  );

  const ListHeader = useCallback(() => (
    <View style={styles.headerContainer}>
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

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle1}>Top Services</Text>

        {/* Added wrapper with isolated layout gaps to prevent header layout corruption */}
        <View style={styles.topServicesWrapper}>
          {topServices.map((item) => (
            <ServicesCards
              key={item.id}
              name={item.name}
              description={item.description}
              image={item.image}
              question={item.question}
              answer={item.answer}
              onPress={() =>
                router.push({
                  pathname: '/service/ServiceDetail',
                  params: { id: item.id.toString() },
                })
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle2}>Trending Services</Text>
      </View>
    </View>
  ), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Header2 />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        
        // FIX: Replaces global container style gap injection with explicit line rendering item-separators
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
  },
  headerBackground: {
    width: wp('100%'),
    height: hp('28%'), 
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '80%',
    justifyContent: 'flex-end',
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2.5%'),
    gap: 4,
  },
  headerTitle: {
    fontSize: wp('6.8%'),
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  sectionContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2.5%'),
  },
  sectionTitle1: {
    fontSize: wp('4.6%'),
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: hp('3%'),
  },
  topServicesWrapper: {
  },
  sectionTitle2: {
    fontSize: wp('4.6%'),
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: hp('3%'), 
  },
  
  /* FIXED GRID & GAP RESTRUCTURING */
  listContent: {
    paddingBottom: hp('4%'),
  },
  rowSeparator: {
    height: hp('2.5%'), 
  },
  pairRow: {
    flexDirection: 'row',
    paddingHorizontal: wp('4%'),
    justifyContent: 'space-between',
  },
  serviceItemContainer: {
    width: wp('43.5%'), 
  },
  featuredContainer: {
    // CHANGED: Added dynamic vertical margin to create clear spacing on top and bottom 
    marginVertical: hp('1.5%'),
    // Maintained the horizontal layout margin from the side of the screen
    marginHorizontal: wp('4%'),
    
    borderRadius: 16,
    overflow: 'hidden',
    height: hp('22%'), 
    elevation: 4,
    shadowColor: '#295C59',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  featuredLabel: {
    fontSize: wp('3%'),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredName: {
    fontSize: wp('5.2%'),
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
});
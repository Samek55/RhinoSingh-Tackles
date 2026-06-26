import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';

import Email from '../../../assets/icons/contact/email_1.png';
import Location from '../../../assets/icons/contact/location-pin.png';
import Website from '../../../assets/icons/contact/globe.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header2 from '@/components/Header2';

const ICON_SIZE = hp('3.3%');
const MAP_URL = 'https://maps.app.goo.gl/araE5tx5DdGJnA3u5';

export default function ContactScreen() {

  const openWebsite = useCallback(() => {
    Linking.openURL('https://RocketSingh.app');
  }, []);

  const handleEmailPress = useCallback(() => {
    Linking.openURL('mailto:help@rocketsingh.app');
  }, []);

  const handleMapPress = useCallback(() => {
    Linking.openURL(MAP_URL);
  }, []);

  return (
    <View style={styles.screen}>
      <Header2 />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>We're always here to help you out.</Text>

          {/* MAP */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={handleMapPress} 
            style={styles.imageContainer}
          >
            <Image
              source={require('../../../assets/images/chennai.jpg')}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>Tap to Open Map</Text>
            </View>
          </TouchableOpacity>

          {/* COMPANY */}
          <Text style={styles.companyName}>RocketSingh | SuperFast Service</Text>
          <Text style={styles.companySubtitle}>
            On Demand Home Service in Chennai
          </Text>

          {/* CARDS */}
          <View style={styles.gridBox}>

            {/* LOCATION */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleMapPress} 
              style={styles.card}
            >
              <View style={styles.iconContainer}>
                <Image source={Location} style={styles.icon} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Visit us</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  LLTM, Bartaprak, PIN-SPAN 2026, Chennai, India.
                </Text>
              </View>
            </TouchableOpacity>

            {/* EMAIL */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleEmailPress} 
              style={styles.card}
            >
              <View style={styles.iconContainer}>
                <Image source={Email} style={styles.icon} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Email us</Text>
                <Text style={[styles.cardSubtitle, styles.linkText]}>
                  help@rocketsingh.app
                </Text>
              </View>
            </TouchableOpacity>

            {/* WEBSITE */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={openWebsite} 
              style={styles.card}
            >
              <View style={styles.iconContainer}>
                <Image source={Website} style={styles.icon} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Website</Text>
                <Text style={[styles.cardSubtitle, styles.linkText]}>
                  https://RocketSingh.app
                </Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Soft, modern off-white background
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.5%'),
    paddingBottom: hp('4%'),
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: wp('3.8%'),
    color: '#64748B', // Slate gray for better hierarchy
    marginTop: 4,
    marginBottom: hp('2.5%'),
  },
  imageContainer: {
    width: '100%',
    height: hp('25%'),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.9)', // Matching brand green with opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mapBadgeText: {
    color: '#FFF',
    fontSize: wp('3%'),
    fontWeight: '600',
  },
  companyName: {
    fontSize: wp('5%'),
    fontWeight: '700',
    marginTop: hp('3%'),
    color: '#064E3B',
  },
  companySubtitle: {
    fontSize: wp('3.6%'),
    color: '#475569',
    marginTop: 2,
    marginBottom: hp('3%'),
  },
  gridBox: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9', // Subtle layout border
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: hp('5.5%'),
    height: hp('5.5%'),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: wp('3.4%'),
    color: '#64748B',
    lineHeight: wp('4.5%'),
  },
  linkText: {
    fontSize: wp('3.4%'),
    color: '#64748B',
    lineHeight: wp('4.5%'),
  },
});
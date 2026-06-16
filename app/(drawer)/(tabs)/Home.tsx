import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
} from 'react-native';

import ServicesCard from '../../../components/home/ServicesCard';
import ProfessionalCard from '../../../components/home/ProfessionalCard';
import NumberBar from '../../../components/home/NumberBar';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { useRef, useEffect } from 'react';
import Header2 from '@/components/Header2';

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView | null>(null);
  
  // 1. Animated value to smoothly drive the bottom layout spacing
  const keyboardHeightAnimated = useRef(new Animated.Value(hp('2%'))).current;

  // --- ADJUSTABLE CUSTOM GAP ---
  // Lower values keep the input closer to the keyboard. 
  // Higher values push it up higher. Try values like 0, 15, 30, or 50.
  const CUSTOM_GAP = 20;

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const targetKeyboardHeight = e.endCoordinates.height;
        const animationDuration = e.duration || 250;

        // Smoothly expand the bottom layout gap to match the incoming keyboard
        Animated.timing(keyboardHeightAnimated, {
          toValue: targetKeyboardHeight,
          duration: animationDuration,
          useNativeDriver: false, // Must be false since we are animating a layout height property
        }).start();

        // Use a minor delay to let the layout recalculate, then fire a silky smooth scroll
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            // Target coordinate shifts exactly above the keyboard wall minus your custom gap
            y: hp('40%') + CUSTOM_GAP, 
            animated: true,
          });
        }, 50);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        const animationDuration = e.duration || 200;

        // Smoothly collapse the spacer back down when keyboard dismisses
        Animated.timing(keyboardHeightAnimated, {
          toValue: hp('5%'),
          duration: animationDuration,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardHeightAnimated]);

  return (
    <View style={styles.screen}>
      <Header2 />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bannerTxt}>
          <Text style={{ fontWeight: '800', fontSize: hp('2.8%'), color: '#ffffff' }}>RocketSingh</Text>
          <Text style={{ fontWeight: '800', fontSize: hp('2.3%'), color: '#fff' }}>SuperFast Service</Text>
        </View>

        <View style={styles.container}>
          <Image
            source={require('../../../assets/home/home.jpeg')}
            style={styles.banner}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <Text style={styles.title}>RocketSingh | SuperFast Service</Text>

            <Text style={styles.subtitle}>
              On Demand Home Service in Chennai
            </Text>

            <Text style={styles.sectionTitle}>Top Services</Text>

            <View style={styles.row1}>
              <ServicesCard
                title="Painting"
                image={require('../../../assets/services/homeImprovement/painting.jpg')}
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: { id: '13' },
                  })
                }
              />

              <ServicesCard
                title="Plumbing"
                image={require('../../../assets/services/HomeRepairANDMaintenance/plumbing.jpg')}
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: { id: '6' },
                  })
                }
              />

              <ServicesCard
                title="Tiling"
                image={require('../../../assets/services/homeImprovement/tiling-work.jpg')}
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: { id: '16' },
                  })
                }
              />
            </View>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>Top Professionals</Text>

            <View style={styles.row2}>
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/1_aravind.jpeg')}
                title="Aravind"
                subtitle=""
              />
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/2_anil.jpeg')}
                title="Anil"
                subtitle=""
              />
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/3_vallam.jpeg')}
                title="Vallam"
                subtitle=""
              />
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/4_subra.jpeg')}
                title="Subra"
                subtitle=""
              />
            </View>

            <View style={styles.numberBarContainer}>
              <NumberBar />
            </View>

            {/* 2. Changed to Animated.View to gracefully slide layout spaces open and shut */}
            <Animated.View style={{ height: keyboardHeightAnimated }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  banner: {
    width: '100%',
    height: hp('25%'),
  },
  bannerTxt: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 9,
  },
  content: {
    paddingHorizontal: wp('4%'),
    paddingTop: 15,
  },
  title: {
    fontSize: wp('5%'),
    color: '#064E3B',
    fontWeight: '900',
    marginBottom: hp('0.5%'),
    marginTop: hp('1.5%'),
  },
  subtitle: {
    fontSize: wp('3.5%'),
    color: '#111827',
    fontWeight: '400',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: wp('4.2%'),
    color: '#064E3B',
    fontWeight: '900',
    marginBottom: hp('0.5%'),
    marginTop: hp('1%'),
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  spacer: {
    height: 15,
  },
  numberBarContainer: {
    marginBottom: hp('1%'),
    paddingHorizontal: wp('8%'),
    alignSelf: 'stretch',
  },
});
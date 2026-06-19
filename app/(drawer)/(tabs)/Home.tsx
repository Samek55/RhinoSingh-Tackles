import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ServicesCard from '../../../components/home/ServicesCard';
import ProfessionalCard from '../../../components/home/ProfessionalCard';
import NumberBar from '../../../components/home/NumberBar';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import Header2 from '@/components/Header2';

(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Header2 />

      {/* This replacement component automatically manages inner views smoothly */}
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        // This adds specific buffer space above the keyboard wall when focused
        extraScrollHeight={130} 
        // Prevents layout jumps when shifting between input elements
        enableAutomaticScroll={true}
      >
        <Image
          source={require('../../../assets/home/home.jpeg')}
          style={styles.banner}
          resizeMode="cover"
        />

        <View style={styles.bannerTxt}>
          <Text style={{ fontWeight: '800', fontSize: hp('2.8%'), color: '#ffffff' }}>RocketSingh</Text>
          <Text style={{ fontWeight: '800', fontSize: hp('2.3%'), color: '#fff' }}>SuperFast Service</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>RocketSingh | SuperFast Service</Text>
          <Text style={styles.subtitle}>On Demand Home Service in Chennai</Text>

          <Text style={styles.sectionTitle}>Top Services</Text>
          <View style={styles.row1}>
            <ServicesCard
              title="Painting"
              image={require('../../../assets/services/homeImprovement/painting.jpg')}
              onPress={() => router.push({ pathname: '/service/ServiceDetail', params: { id: '13' } })}
            />
            <ServicesCard
              title="Plumbing"
              image={require('../../../assets/services/HomeRepairANDMaintenance/plumbing.jpg')}
              onPress={() => router.push({ pathname: '/service/ServiceDetail', params: { id: '6' } })}
            />
            <ServicesCard
              title="Tiling"
              image={require('../../../assets/services/homeImprovement/tiling-work.jpg')}
              onPress={() => router.push({ pathname: '/service/ServiceDetail', params: { id: '16' } })}
            />
          </View>

          <View style={styles.spacer} />

          <Text style={styles.sectionTitle}>Top Professionals</Text>
          <View style={styles.row2}>
            <ProfessionalCard image={require('../../../assets/topProfessionals/1_aravind.jpeg')} title="Aravind" subtitle="" />
            <ProfessionalCard image={require('../../../assets/topProfessionals/2_anil.jpeg')} title="Anil" subtitle="" />
            <ProfessionalCard image={require('../../../assets/topProfessionals/3_vallam.jpeg')} title="Vallam" subtitle="" />
            <ProfessionalCard image={require('../../../assets/topProfessionals/4_subra.jpeg')} title="Subra" subtitle="" />
          </View>

          <View style={styles.numberBarContainer}>
            <NumberBar />
          </View>
        </View>
      </KeyboardAwareScrollView>
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
    // Keeps a perfect fallback margin so components don't clip the bottom floor
    paddingBottom: hp('6%'), 
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
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('8%'),
    alignSelf: 'stretch',
  },
});
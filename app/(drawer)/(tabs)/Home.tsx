import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import ServicesCard from '../../../components/home/ServicesCard';
import ProfessionalCard from '../../../components/home/ProfessionalCard';
import NumberBar from '../../../components/home/NumberBar';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header1 from '@/components/Header1';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: '#fff',
          flexGrow: 1,
        }}
      >
        {/* header */}
        <Header1 />


        <View style={styles.container}>

          {/* Banner */}
          <Image
            source={require('../../../assets/home/home.jpeg')}
            style={styles.banner}
            resizeMode="cover"
          />



          {/* Content */}
          <View style={styles.content}>

            <Text style={styles.title}>RocketSingh | SuperFast Service</Text>

            <Text style={styles.subtitle}>
              On Demand Home Service in Chennai
            </Text>

            {/* Top Services */}
            <Text style={styles.sectionTitle}>Top Services</Text>

            <View style={styles.row1}>
              <ServicesCard
                title="Painting"
                image={require('../../../assets/services/homeImprovement/painting.jpg')}
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: {
                      id: '13',
                    },
                  })
                }
              />

              <ServicesCard
                title="Plumbing"
                image={require('../../../assets/services/HomeRepairANDMaintenance/plumbing.jpg')}
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: {
                      id: '6',
                    },
                  })
                }
              />

              <ServicesCard
                title="Tiling"
                image={require('../../../assets/services/homeImprovement/tiling-work.jpg')}
                onPress={() =>
                  router.push({
                    pathname: '/service/ServiceDetail',
                    params: {
                      id: '16',
                    },
                  })
                }
              />
            </View>

            <View style={{ height: 15 }} />

            {/* Professionals */}
            <Text style={styles.sectionTitle}>Top Professionals</Text>

            <View style={styles.row2}>
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/1_jamesWalker.jpg')}
                title="James"
                subtitle=""
              />
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/2_michaelTurner.jpg')}
                title="Michael"
                subtitle=""
              />
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/3_matthewKing.jpg')}
                title="Matthew"
                subtitle=""
              />
              <ProfessionalCard
                image={require('../../../assets/topProfessionals/5_joshua_adams.jpg')}
                title="Joshua"
                subtitle=""
              />
            </View>

            <View style={styles.numberBarContainer}>
              <NumberBar
              />
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },

  banner: {
    width: '100%',
    height: hp('30%'),
  },

  headerWrapper: {
    position: 'absolute',
    top: hp('2%'),
    left: 0,
    right: 0,
    paddingHorizontal: wp('0.15%'),
    zIndex: 1,     // reduce
    elevation: 1,  // Android fix
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
    marginTop: hp('1.5%')
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
    marginTop: hp('1%')
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
  },

  numberBarContainer: {
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
});


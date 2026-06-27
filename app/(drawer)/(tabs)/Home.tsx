import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ServicesCard from '../../../components/home/ServicesCard';
import NumberBar from '../../../components/home/NumberBar';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { useRef, useMemo } from 'react';
import { servicesData2 } from '../../../src/data/ServiceData';
import Header2 from '@/components/Header2';

const HOME_SERVICE_NAMES = [
  'Deep Cleaning',
  'Pressure Washing',
  'Roof & Gutter Cleaning', // Fixed typo string comparison here
  'Handyman',
  'Carpentry', 
  'Plumbing',
  'Electrical Repairs',
  'Flooring Fixes',
  'Washing Machine Repair'
];

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView | null>(null);

  const shuffledServices = useMemo(() => {
    const pool = servicesData2.filter((service) => 
      HOME_SERVICE_NAMES.map(n => n.toLowerCase()).includes(service.name.toLowerCase())
    );
    return [...pool].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <View style={styles.screen}>
      <Header2 />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── HERO ─────────────────────────────────────── */}
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/home/home2.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(18,46,44,0.98)']}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroTitle}>RocketSingh{'\n'}Superfast Services</Text>
            <Text style={styles.heroSub}>
              Trusted Homeservice at Rocket Speed.
            </Text>

            <View style={styles.heroNumberBar}>
              <NumberBar
                onFocus={() =>
                  scrollRef.current?.scrollTo({ y: hp('45%'), animated: true })
                }
              />
            </View>
          </LinearGradient>
        </View>

        {/* ── TOP SERVICES ──────────────────────────────── */}
        <View style={styles.section}>
          
          {/* FEATURED BANNER */}
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.88}
            onPress={() =>
              router.push({ pathname: '/service/ServiceDetail', params: { id: '1' } })
            }
          >
            <Image
              source={require('../../../assets/services/cleaningANDexteriorMaintenance/deep-cleaning.jpg')}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(28,43,42,0.95)']}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Most Popular</Text>
              </View>
              <Text style={styles.featuredTitle}>Deep Cleaning</Text>
              <Text style={styles.featuredSub}>Professional home cleaning service</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* SECTION HEADER CONTAINER */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Top Services</Text>
            <TouchableOpacity onPress={() => router.push('/Service')} hitSlop={12}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* HORIZONTAL CARDS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScrollContent}
          >
            {shuffledServices.map((service) => (
              <ServicesCard
                key={service.id}
                title={service.name}
                image={service.image}
                onPress={() =>
                  router.push({ pathname: '/service/ServiceDetail', params: { id: String(service.id) } })
                }
              />
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#F6F9F8' 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: hp('5%') 
  },

  /* HERO SECTION */
  hero: { 
    width: '100%', 
    height: hp('36%'), 
    position: 'relative' 
  },
  heroImage: { 
    width: '100%', 
    height: '100%' 
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0, 
    left: 0, 
    right: 0,
    height: '85%',
    justifyContent: 'flex-end',
    paddingHorizontal: wp('5.5%'),
    paddingBottom: hp('3%'),
  },
  heroTitle: {
    fontSize: wp('7%'),
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: wp('8.8%'),
    letterSpacing: -0.2,
  },
  heroSub: {
    fontSize: wp('3.4%'),
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '400',
    marginTop: hp('0.8%'),
    marginBottom: hp('1.8%'),
  },
  heroNumberBar: { 
    marginTop: hp('0.5%') 
  },

  /* CATEGORIES & SECTIONS */
  section: { 
    marginTop: hp('2.5%'), 
    paddingHorizontal: wp('4.5%') 
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('2.5%'),
    marginBottom: hp('1.5%'),
  },
  sectionTitle: { 
    fontSize: wp('4.6%'), 
    fontWeight: '800', 
    color: '#1C2B2A',
    letterSpacing: -0.1,
  },
  seeAll: { 
    fontSize: wp('3.4%'), 
    fontWeight: '600', 
    color: '#295C59',
    paddingLeft: wp('2%')
  },
  
  /* FEATURED CARD */
  featuredCard: {
    width: '100%',
    height: hp('23%'),
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: hp('1%'),
    elevation: 3,
    shadowColor: '#1C2B2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  featuredImage: { 
    width: '100%', 
    height: '100%' 
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0, 
    left: 0, 
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: wp('4.5%'),
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    marginBottom: hp('1%'),
  },
  featuredBadgeText: { 
    fontSize: wp('2.8%'), 
    color: '#295C59', 
    fontWeight: '700' 
  },
  featuredTitle: { 
    fontSize: wp('5%'), 
    fontWeight: '800', 
    color: '#ffffff' 
  },
  featuredSub: { 
    fontSize: wp('3.2%'), 
    color: 'rgba(255,255,255,0.85)', 
    fontWeight: '400',
    marginTop: hp('0.2%')
  },

  /* HORIZONTAL SCROLL ALIGNMENT */
  servicesScrollContent: {
    flexDirection: 'row',
    alignItems: 'center', 
    paddingVertical: hp('1%'),
    paddingRight: wp('6%'), 
    gap: wp('4%'),
  },
});
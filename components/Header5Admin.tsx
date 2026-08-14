import { TouchableOpacity, StyleSheet, View, Image, Text, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCountry } from '@/src/context/countryContext';

export default function Header5() {
  const navigation = useNavigation<any>();
  const { countryInfo, toggleCountry } = useCountry();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />
      <LinearGradient
        colors={['#064E3B', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.subHeader}>
          <View style={styles.left}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.leftIcon}
              />
              <View style={styles.iconGlow} />
            </View>
            <View>
              <Text style={styles.title}>RocketSingh</Text>
            </View>
          </View>

          <View style={styles.right}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={toggleCountry}
            >
              <Text style={styles.flagEmoji}>{countryInfo.flag}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    paddingTop: 45,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    flex: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  iconContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  leftIcon: {
    width: 39,
    height: 39,
    resizeMode: 'contain',
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: -2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
});
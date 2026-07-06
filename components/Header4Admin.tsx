import { TouchableOpacity, StyleSheet, View, Image, Text, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Header4() {
  const navigation = useNavigation<any>();

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
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Image
                source={require('../assets/header/right.png')}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
              activeOpacity={0.8}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="menu-outline" size={28} color='#fff' />
              </View>
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
    gap: 2,
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
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#064E3B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  rightIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuButton: {
    padding: 4,
  },
  menuIconContainer: {
    width: 41,
    height: 41,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: 'rgba(255,255,255,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
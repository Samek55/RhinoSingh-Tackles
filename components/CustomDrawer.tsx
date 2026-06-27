import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { auth } from '@/src/firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe try/catch static import for OneSignal to avoid runtime crashes if not configured
let OneSignal: any = null;
try {
  OneSignal = require('react-native-onesignal').OneSignal;
} catch (e) {
  console.warn('OneSignal module not available dynamically');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCALE_FACTOR = SCREEN_WIDTH / 375;
const FIXED_FONT_19 = Platform.OS === 'ios' ? Math.round(19 * SCALE_FACTOR) : Math.round(19 * SCALE_FACTOR) - 1;
const FIXED_FONT_18 = Platform.OS === 'ios' ? Math.round(18 * SCALE_FACTOR) : Math.round(18 * SCALE_FACTOR) - 1;
const FIXED_FONT_13_5 = Platform.OS === 'ios' ? Math.round(13.5 * SCALE_FACTOR) : Math.round(13.5 * SCALE_FACTOR) - 1;
const FIXED_FONT_10_5 = Platform.OS === 'ios' ? Math.round(10.5 * SCALE_FACTOR) : Math.round(10.5 * SCALE_FACTOR) - 1;

export default function CustomDrawer(_props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fbUser, setFbUser] = useState<User | null>(null);

  const isActive = (route: string) => pathname === route;

  const navigateTo = (route: any) => {
    _props.navigation.closeDrawer();
    // Wait for the drawer close transition to finish before transitioning screens
    InteractionManager.runAfterInteractions(() => {
      router.push(route);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setFbUser(user);
      } else {
        setIsLoggedIn(false);
        setFbUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      _props.navigation.closeDrawer();
      await signOut(auth);

      try {
        await AsyncStorage.removeItem('userProfileSetupCompleted');
      } catch (e) {
        console.warn('Failed to clear storage flag:', e);
      }

      if (OneSignal) {
        try {
          OneSignal.logout();
        } catch (e) {
          console.warn('OneSignal logout failed:', e);
        }
      }

      Alert.alert("Success", "Logged out cleanly.");
      InteractionManager.runAfterInteractions(() => {
        router.replace('/Home');
      });
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={['top', 'bottom']}>
      <View style={styles.card}>

        {/* PROFILE SECTION */}
        <View style={styles.profileBox}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.avatar}
          />
          <Text style={styles.name} numberOfLines={1}>RocketSingh</Text>
          {fbUser && (
            <Text style={styles.firebaseAuthText} numberOfLines={1} ellipsizeMode="tail">
              {fbUser.email || fbUser.phoneNumber || "Authenticated User"}
            </Text>
          )}
        </View>

        {/* MENU */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menu}
        >
          {/* TOP SECTION */}
          <MenuItem
            icon={isActive('/Home') ? "home" : "home-outline"}
            label="Home"
            active={isActive('/Home')}
            onPress={() => navigateTo('/Home')}
          />
          <MenuItem
            icon={isActive('/Service') ? "construct" : "construct-outline"}
            label="Services"
            active={isActive('/Service')}
            onPress={() => navigateTo('/Service')}
          />
          {!isLoggedIn && (
            <MenuItem
              icon={isActive('/Book') ? "card" : "card-outline"}
              label="Book a Service"
              active={isActive('/Book')}
              onPress={() => navigateTo('/Book')}
            />
          )}
          <MenuItem
            icon={isActive('/About') ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
            label="About"
            active={isActive('/About')}
            onPress={() => navigateTo('/About')}
          />
          <MenuItem
            icon={isActive('/Contact') ? "call" : "call-outline"}
            label="Contact"
            active={isActive('/Contact')}
            onPress={() => navigateTo('/Contact')}
          />
          
          <View style={styles.divider} />

          {/* MIDDLE SECTION */}
          {isLoggedIn ? (
            <>
              <MenuItem
                icon={isActive('/admin/BookingHistory') ? "calendar" : "calendar-outline"}
                label="View Booking"
                active={isActive('/admin/BookingHistory')}
                onPress={() => navigateTo('/admin/BookingHistory')}
              />
              <MenuItem
                icon={isActive('/admin/Notifications') ? "notifications" : "notifications-outline"}
                label="Notifications"
                active={isActive('/admin/Notifications')}
                onPress={() => navigateTo('/Home')}
              />
              <MenuItem
                icon={isActive('/admin/UpdateProfile') ? "person-circle" : "person-circle-outline"}
                label="Update Profile"
                active={isActive('/admin/UpdateProfile')}
                onPress={() => navigateTo('/admin/UpdateProfile')}
              />
            </>
          ) : (
            <>
              <MenuItem
                icon={isActive('/Partnership') ? "people" : "people-outline"}
                label="Become a Partner"
                active={isActive('/Partnership')}
                onPress={() => navigateTo('/Partnership')}
              />
              <MenuItem
                icon={isActive('/Career') ? "briefcase" : "briefcase-outline"}
                label="Join as a Professional"
                active={isActive('/Career')}
                onPress={() => navigateTo('/Career')}
              />
              <MenuItem
                icon={isActive('/FAQs') ? "help-circle" : "help-circle-outline"}
                label="FAQs"
                active={isActive('/FAQs')}
                onPress={() => navigateTo('/FAQs')}
              />
              <MenuItem
                icon={isActive('/Glossary') ? "book" : "book-outline"}
                label="Glossary"
                active={isActive('/Glossary')}
                onPress={() => navigateTo('/Glossary')}
              />
            </>
          )}

          <View style={styles.divider} />

          {/* BOTTOM AUTH BUTTON */}
          {isLoggedIn ? (
            <MenuItem
              icon="log-out-outline"
              label="Log Out"
              active={false}
              onPress={handleLogout}
              isLogout={true}
            />
          ) : (
            <MenuItem
              icon={isActive('/admin/AdminLogin') ? "shield-checkmark" : "shield-checkmark-outline"}
              label="Admin"
              active={false}
              onPress={() => navigateTo('/Admin')}
            />
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

/* MENU ITEM SUB-COMPONENT */
type MenuItemProps = {
  icon: any;
  label: string;
  onPress: () => void;
  active: boolean;
  isLogout?: boolean;
};

// Pure React component wrapper optimization to avoid unnecessary menu item re-renders
const MenuItem = React.memo(({ icon, label, onPress, active, isLogout }: MenuItemProps) => {
  const getIconColor = () => {
    if (active) return '#059669';
    if (isLogout) return '#EF4444';
    return '#6B7280';
  };

  return (
    <TouchableOpacity
      style={[styles.item, active && styles.itemActive]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      {active && <View style={styles.activeIndicator} />}
      <Ionicons
        name={icon}
        size={FIXED_FONT_19}
        color={getIconColor()}
        style={active ? styles.iconActive : null}
      />
      <Text style={[
        styles.label,
        active && styles.labelActive,
        isLogout && styles.labelLogout
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

/* STYLES */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: wp('6%'),
    margin: wp('2.5%'),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      }
    })
  },
  profileBox: {
    backgroundColor: '#064E3B',
    paddingVertical: hp('3.5%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.5%')
  },
  avatar: {
    width: Math.min(hp('7.5%'), 70),
    height: Math.min(hp('7.5%'), 70),
    borderRadius: Math.min(hp('7.5%'), 70) / 2,
    marginBottom: 10
  },
  name: {
    fontSize: FIXED_FONT_18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8
  },
  menu: {
    paddingHorizontal: wp('3.5%'),
    paddingBottom: hp('3%')
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 12,
    marginBottom: 6,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  itemActive: {
    backgroundColor: '#ECFDF5',
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      }
    })
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 4,
    backgroundColor: '#059669',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconActive: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    marginLeft: wp('4%'),
    fontSize: FIXED_FONT_13_5,
    fontWeight: '500',
    color: '#4B5563'
  },
  labelActive: {
    color: '#047857',
    fontWeight: '700'
  },
  labelLogout: {
    color: '#EF4444',
    fontWeight: '600'
  },
  divider: {
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    marginVertical: hp('1.5%'),
    marginHorizontal: wp('2%'),
  },
  firebaseAuthText: {
    fontSize: FIXED_FONT_10_5,
    color: '#A7F3D0',
    fontWeight: '600',
    textAlign: 'center'
  },
});
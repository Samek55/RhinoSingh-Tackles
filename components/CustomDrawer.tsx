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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { auth } from '@/src/firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive utility to keep scaling intact without text overflowing
const scaleFont = (size: number) => {
  const scale = SCREEN_WIDTH / 375; // baseline screen width
  const newSize = size * scale;
  return Platform.OS === 'ios' ? Math.round(newSize) : Math.round(newSize) - 1;
};

export default function CustomDrawer(_props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [, setEmail] = useState('');

  const isActive = (route: string) => pathname === route;

  const navigateTo = (route: any) => {
    _props.navigation.closeDrawer();
    router.push(route);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setFbUser(user);
        if (user.email) setEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setFbUser(null);
        setEmail('');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      _props.navigation.closeDrawer();
      await signOut(auth);

      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('userProfileSetupCompleted');
      } catch (e) {
        console.warn('Failed to clear storage flag:', e);
      }

      try {
        const { OneSignal } = require('react-native-onesignal');
        OneSignal.logout();
      } catch (e) {
        console.warn('OneSignal logout failed:', e);
      }

      Alert.alert("Success", "Logged out cleanly.");
      router.replace('/Home'); 
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
            <View style={styles.firebaseAuthContainer}>
              <Ionicons name="logo-firebase" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
              <Text style={styles.firebaseAuthText} numberOfLines={1} ellipsizeMode="tail">
                Logged as: {fbUser.email || fbUser.phoneNumber || "Authenticated User"}
              </Text>
            </View>
          )}
        </View>

        {/* MENU */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menu}
        >
          <MenuItem
            icon="home-outline"
            label="Home"
            active={isActive('/Home')}
            onPress={() => navigateTo('/Home')}
          />

          <MenuItem
            icon="construct-outline"
            label="Services"
            active={isActive('/Service')}
            onPress={() => navigateTo('/Service')}
          />

          <MenuItem
            icon="card-outline"
            label="Book a Service"
            active={isActive('/Book')}
            onPress={() => navigateTo('/Book')}
          />

          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="About"
            active={isActive('/About')}
            onPress={() => navigateTo('/About')}
          />

          <MenuItem
            icon="call-outline"
            label="Contact"
            active={isActive('/Contact')}
            onPress={() => navigateTo('/Contact')}
          />

          <View style={styles.divider} />

          {/* DYNAMIC MIDDLE SECTION */}
          {isLoggedIn ? (
            <>
              <MenuItem
                icon="calendar-outline"
                label="View Booking"
                active={isActive('/admin/BookingHistory')}
                onPress={() => navigateTo('/admin/BookingHistory')}
              />

              <MenuItem
                icon="cash-outline"
                label="View Payouts"
                active={isActive('/admin/Payouts')}
                onPress={() => navigateTo('/admin/Payouts')}
              />

              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                active={isActive('/admin/Notifications')}
                onPress={() => navigateTo('/admin/Notifications')}
              />

              <MenuItem
                icon="person-circle-outline"
                label="Update Profile"
                active={isActive('/admin/UpdateProfile')}
                onPress={() => navigateTo('/admin/UpdateProfile')}
              />
            </>
          ) : (
            <>
              <MenuItem
                icon="people-outline"
                label="Become a Partner"
                active={isActive('/Partnership')}
                onPress={() => navigateTo('/Partnership')}
              />

              <MenuItem
                icon="briefcase-outline"
                label="Join as a Professional"
                active={isActive('/Career')}
                onPress={() => navigateTo('/Career')}
              />

              <MenuItem
                icon="help-circle-outline"
                label="FAQs"
                active={isActive('/FAQs')}
                onPress={() => navigateTo('/FAQs')}
              />

              <MenuItem
                icon="book-outline"
                label="Glossary"
                active={isActive('/Glossary')}
                onPress={() => navigateTo('/Glossary')}
              />
            </>
          )}

          <View style={styles.divider} />

          {/* DYNAMIC AUTH BUTTON */}
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
              icon="shield-checkmark-outline"
              label="Admin"
              active={isActive('/admin/AdminLogin')}
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

function MenuItem({ icon, label, onPress, active, isLogout }: MenuItemProps) {
  // Gracefully handles standard text colors vs logout specific styling
  const getIconColor = () => {
    if (active) return '#16A34A';
    if (isLogout) return '#DC2626';
    return '#333';
  };

  return (
    <TouchableOpacity
      style={[
        styles.item, 
        active && styles.itemActive,
        isLogout && styles.itemLogout
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={scaleFont(18)}
        color={getIconColor()}
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
}

/* STYLES */
const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  card: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: wp('6%'), // Fluid rounding
    margin: wp('2.5%'), 
    overflow: 'hidden', 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      }
    })
  },
  profileBox: { 
    backgroundColor: '#064E3B', 
    paddingVertical: hp('3.5%'), // Scales perfectly relative to screen height
    paddingHorizontal: wp('5%'), 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: hp('1.5%') 
  },
  avatar: { 
    width: Math.min(hp('7.5%'), 70), // Caps asset scales so it looks clean on tablets
    height: Math.min(hp('7.5%'), 70), 
    borderRadius: Math.min(hp('7.5%'), 70) / 2, 
    marginBottom: 10 
  },
  name: { 
    fontSize: scaleFont(18), 
    fontWeight: '700', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  menu: { 
    paddingHorizontal: wp('4%'), 
    paddingBottom: hp('3%') // Ensures enough bottom space on screens without virtual home indicators
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: hp('1.4%'), // Dynamic item height matching touch targets
    paddingHorizontal: wp('3%'), 
    borderRadius: 12, 
    marginBottom: 4 
  },
  itemActive: { 
    backgroundColor: '#DCFCE7' 
  },
  itemLogout: {
    backgroundColor: '#FEF2F2', // Soft red backplane for explicit logout actions
  },
  label: { 
    marginLeft: wp('4%'), 
    fontSize: scaleFont(13.5), 
    fontWeight: '500', 
    color: '#333' 
  },
  labelActive: { 
    color: '#16A34A', 
    fontWeight: '700' 
  },
  labelLogout: {
    color: '#DC2626',
    fontWeight: '600'
  },
  divider: { 
    borderTopWidth: 1, 
    borderColor: '#f3f4f6', 
    marginVertical: hp('1.2%') 
  },
  firebaseAuthContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFFBEB', 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#FEF3C7', 
    maxWidth: '95%', 
    alignSelf: 'center' 
  },
  firebaseAuthText: { 
    fontSize: scaleFont(10.5), 
    color: '#D97706', 
    fontWeight: '600', 
    textAlign: 'center' 
  },
});
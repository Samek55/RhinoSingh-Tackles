import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { auth } from '@/src/firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';

export default function CustomDrawer(_props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [, setEmail] = useState('');

  const isActive = (route: string) => pathname === route;

  // Unified routing wrapper that explicitly slides the drawer shut first
  const navigateTo = (route: any) => {
    _props.navigation.closeDrawer();
    router.push(route);
  };

  // 1. Single unified listener for auth changes
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

  // 2. Handle the Logout Action
  const handleLogout = async () => {
    try {
      _props.navigation.closeDrawer(); // Close drawer layout container instantly
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
          <Text style={styles.name}>RocketSingh</Text>

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

/* MENU ITEM */
function MenuItem({ icon, label, onPress, active }: any) {
  return (
    <TouchableOpacity
      style={[styles.item, active && styles.itemActive]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? '#16A34A' : '#333'}
      />
      <Text style={[styles.label, active && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: 'transparent' },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 30, margin: 10, overflow: 'hidden', elevation: 10 },
  profileBox: { backgroundColor: '#064E3B', paddingVertical: 35, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 10 },
  menu: { paddingHorizontal: 15, paddingVertical: 10 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginBottom: 5 },
  itemActive: { backgroundColor: '#DCFCE7' },
  label: { marginLeft: 15, fontSize: 14, fontWeight: '500', color: '#333' },
  labelActive: { color: '#16A34A', fontWeight: '700' },
  divider: { borderTopWidth: 1, borderColor: '#eee', marginVertical: 10 },
  firebaseAuthContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFBEB', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7', maxWidth: '100%', alignSelf: 'center' },
  firebaseAuthText: { fontSize: 11, color: '#D97706', fontWeight: '600', textAlign: 'center' },
});
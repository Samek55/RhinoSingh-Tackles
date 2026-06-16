import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { auth } from '@/src/firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';


export default function CustomDrawer(_props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isActive = (route: string) => pathname === route;

  // 1. Listen to Firebase Auth state updates automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    // Clean up the subscription on unmount
    return unsubscribe;
  }, []);

  // 2. Handle the Logout Action
  const handleLogout = async () => {
    try {
      await signOut(auth);

      // Clean up local storage flags if needed
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('userProfileSetupCompleted');
      } catch (e) {
        console.warn('Failed to clear storage flag:', e);
      }

      // Clean up OneSignal if you're using it
      try {
        const { OneSignal } = require('react-native-onesignal');
        OneSignal.logout();
      } catch (e) {
        console.warn('OneSignal logout failed:', e);
      }

      Alert.alert("Success", "Logged out cleanly.");
      router.replace('/Home'); // Redirect to your landing or home page
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={['top', 'bottom']}>
      <View style={styles.card}>

        {/* PROFILE */}
        <View style={styles.profileBox}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>RocketSingh</Text>
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
            onPress={() => router.push('/Home')}
          />

          <MenuItem
            icon="construct-outline"
            label="Services"
            active={isActive('/Service')}
            onPress={() => router.push('/Service')}
          />

          <MenuItem
            icon="card-outline"
            label="Book a Service"
            active={isActive('/Book')}
            onPress={() => router.push('/Book')}
          />

          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="About"
            active={isActive('/About')}
            onPress={() => router.push('/About')}
          />

          <MenuItem
            icon="call-outline"
            label="Contact"
            active={isActive('/Contact')}
            onPress={() => router.push('/Contact')}
          />

          <View style={styles.divider} />

          <MenuItem
            icon="people-outline"
            label="Become a Partner"
            active={isActive('/Partnership')}
            onPress={() => router.push('/Partnership')}
          />

          <MenuItem
            icon="briefcase-outline"
            label="Join as a Professional"
            active={isActive('/Career')}
            onPress={() => router.push('/Career')}
          />

          <MenuItem
            icon="help-circle-outline"
            label="FAQs"
            active={isActive('/FAQs')}
            onPress={() => router.push('/FAQs')}
          />

          <MenuItem
            icon="book-outline"
            label="Glossary"
            active={isActive('/Glossary')}
            onPress={() => router.push('/Glossary')}
          />

          <View style={styles.divider} />

          {/* DYNAMIC AUTH BUTTON */}
          {isLoggedIn ? (
            <MenuItem
              icon="log-out-outline"
              label="Log Out"
              active={false}
              onPress={handleLogout}
              isLogout={true} // Passed flag to apply custom styling if desired
            />
          ) : (
            <MenuItem
              icon="shield-checkmark-outline"
              label="Admin"
              active={isActive('/admin/AdminLogin')}
              onPress={() => router.push('/Admin')}
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
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 30,
    margin: 10,
    overflow: 'hidden',
    elevation: 10,
  },

  profileBox: {
    backgroundColor: '#F6F6F6',
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    marginBottom: 15,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0, 0, 0,0.8)',
  },

  menu: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5,
  },

  itemActive: {
    backgroundColor: '#DCFCE7',
  },

  label: {
    marginLeft: 15,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  labelActive: {
    color: '#16A34A',
    fontWeight: '700',
  },

  divider: {
    borderTopWidth: 1,
    borderColor: '#eee',
    marginVertical: 10,
  },
});
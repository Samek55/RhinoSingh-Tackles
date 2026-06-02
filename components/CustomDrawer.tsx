import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

export default function CustomDrawer() {
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.wrapper}>
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
        <View style={styles.menu}>

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
            label="Booking"
            active={isActive('/Book')}
            onPress={() => router.push('/Book')}
          />

          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="About Us"
            active={isActive('/About')}
            onPress={() => router.push('/About')}
          />

          <MenuItem
            icon="call-outline"
            label="Contact Us"
            active={isActive('/Contact')}
            onPress={() => router.push('/Contact')}
          />

          <View style={styles.divider} />

          <MenuItem
            icon="people-outline"
            label="Partnership"
            active={isActive('/Partnership')}
            onPress={() => router.push('/Partnership')}
          />

          <MenuItem
            icon="briefcase-outline"
            label="Career"
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

          <MenuItem
            icon="shield-checkmark-outline"
            label="Admin"
            active={isActive('/Admin')}
            onPress={() => router.push('/Admin')}
          />

        </View>

      </View>
    </View>
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
    paddingVertical: 70,
    paddingHorizontal: 10,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
  },

  profileBox: {
    backgroundColor: '#F6F6F6',
    padding: 15,
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
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
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
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
    backgroundColor: '#DCFCE7', // light green
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
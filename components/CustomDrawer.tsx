import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { logoutAdmin } from '@/api/supabase/adminAuth';

// Safe try/catch static import for OneSignal to avoid runtime crashes if not configured
let OneSignal: any = null;
try {
  OneSignal = require('react-native-onesignal').OneSignal;
} catch (e) {
  console.warn('OneSignal module not available dynamically');
}

const { height: SCREEN_H } = Dimensions.get('window');

export default function CustomDrawer(_props: DrawerContentComponentProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null); // Tracks DB security role

  const isActive = (route: string) => pathname === route;

  const navigateTo = (route: any) => {
    _props.navigation.closeDrawer();
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          router.push(route);
        } catch (error) {
          console.error('Navigation error:', error);
          router.replace(route);
        }
      }, 0);
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      const [token, storedPhone, storedRole] = await AsyncStorage.multiGet(['adminSessionToken', 'adminPhone', 'adminRole']);
      if (token[1]) {
        setIsLoggedIn(true);
        setPhone(storedPhone[1]);
        setRole(storedRole[1] || null);
      } else {
        setIsLoggedIn(false);
        setPhone(null);
        setRole(null);
      }
    };

    checkSession();
    const subscription = DeviceEventEmitter.addListener('authChanged', checkSession);
    return () => subscription.remove();
  }, []);

  const handleLogout = async () => {
    try {
      _props.navigation.closeDrawer();
      await logoutAdmin();
      DeviceEventEmitter.emit('authChanged');

      if (OneSignal) {
        try {
          OneSignal.logout();
        } catch (e) {
          console.warn('OneSignal logout failed:', e);
        }
      }

      Alert.alert(
        "Session Ended",
        "You have been securely signed out. See you again soon! 👋",
        [
          {
            text: "OK",
            onPress: () => {
              requestAnimationFrame(() => {
                router.replace('/Home');
              });
            }
          }
        ]
      );

    } catch (error: any) {
      Alert.alert("Logout Failed", "We encountered an issue signing you out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={['top', 'bottom']}>
      <View style={styles.card}>

        {/* PROFILE HEADER */}
        <LinearGradient colors={['#0B6B4F', '#064E3B']} style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.brandName} numberOfLines={1}>RocketSingh</Text>
          <Text style={styles.brandTagline} numberOfLines={1} ellipsizeMode="tail">
            {phone || 'Express Home Service'}
          </Text>
        </LinearGradient>

        {/* MENU */}
        <View style={styles.menu}>
          <MenuItem
            icon={isActive('/Home') ? "home" : "home-outline"}
            label="Home"
            active={isActive('/Home')}
            onPress={() => navigateTo('/Home')}
            compact={!isLoggedIn}
          />
          <MenuItem
            icon={isActive('/Service') ? "construct" : "construct-outline"}
            label="Services"
            active={isActive('/Service')}
            onPress={() => navigateTo('/Service')}
            compact={!isLoggedIn}
          />
          {!isLoggedIn && (
            <MenuItem
              icon={isActive('/Book') ? "card" : "card-outline"}
              label="Book a Service"
              active={isActive('/Book')}
              onPress={() => navigateTo('/Book')}
              compact
            />
          )}
          <MenuItem
            icon={isActive('/About') ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
            label="About"
            active={isActive('/About')}
            onPress={() => navigateTo('/About')}
            compact={!isLoggedIn}
          />
          <MenuItem
            icon={isActive('/Contact') ? "call" : "call-outline"}
            label="Contact"
            active={isActive('/Contact')}
            onPress={() => navigateTo('/Contact')}
            compact={!isLoggedIn}
          />

          {isLoggedIn ? (
            <>
              <MenuItem
                icon={isActive('/admin/BookingHistory') ? "calendar" : "calendar-outline"}
                label="View Booking"
                active={isActive('/admin/BookingHistory')}
                onPress={() => navigateTo('/admin/BookingHistory')}
              />

              {role === "admin" && (
                <>
                  <MenuItem
                    icon={isActive('/admin/HelpboxHistory') ? "help-circle" : "help-circle-outline"}
                    label="Helpbox History"
                    active={isActive('/admin/HelpboxHistory')}
                    onPress={() => navigateTo('/admin/HelpboxHistory')}
                    compact
                  />
                  <MenuItem
                    icon={isActive('/admin/AdminPopUpBanner') ? "information-circle" : "information-circle-outline"}
                    label="Push PopUp"
                    active={isActive('/admin/AdminPopUpBanner')}
                    onPress={() => navigateTo('/admin/AdminPopUpBanner')}
                    compact
                  />
                </>
              )}

              {role === "superadmin" && (
                <>
                  <MenuItem
                    icon={isActive('/admin/HelpboxHistory') ? "help-circle" : "help-circle-outline"}
                    label="Helpbox History"
                    active={isActive('/admin/HelpboxHistory')}
                    onPress={() => navigateTo('/admin/HelpboxHistory')}
                    compact
                  />
                  <MenuItem
                    icon={isActive('/admin/ProfessionalHistory') ? "people" : "people-outline"}
                    label="Professional History"
                    active={isActive('/admin/ProfessionalHistory')}
                    onPress={() => navigateTo('/admin/ProfessionalHistory')}
                    compact
                  />
                </>
              )}

              <MenuItem
                icon={isActive('/admin/ViewNotifications') ? "notifications" : "notifications-outline"}
                label="Notifications"
                active={isActive('/admin/ViewNotifications')}
                onPress={() => navigateTo('/admin/ViewNotifications')}
              />

              {role !== "admin" && role !== "superadmin" && (
                <MenuItem
                  icon={isActive('/admin/UpdateProfile') ? "person-circle" : "person-circle-outline"}
                  label="Update Profile"
                  active={isActive('/admin/UpdateProfile')}
                  onPress={() => navigateTo('/admin/UpdateProfile')}
                />
              )}
            </>
          ) : (
            <>
              <MenuItem
                icon={isActive('/Partnership') ? "people" : "people-outline"}
                label="Become a Partner"
                active={isActive('/Partnership')}
                onPress={() => navigateTo('/Partnership')}
                compact
              />
              <MenuItem
                icon={isActive('/Career') ? "briefcase" : "briefcase-outline"}
                label="Join as a Professional"
                active={isActive('/Career')}
                onPress={() => navigateTo('/Career')}
                compact
              />
              <MenuItem
                icon={isActive('/FAQs') ? "help-circle" : "help-circle-outline"}
                label="FAQs"
                active={isActive('/FAQs')}
                onPress={() => navigateTo('/FAQs')}
                compact
              />
              <MenuItem
                icon={isActive('/Glossary') ? "book" : "book-outline"}
                label="Glossary"
                active={isActive('/Glossary')}
                onPress={() => navigateTo('/Glossary')}
                compact
              />
            </>
          )}
        </View>

        {/* BOTTOM AUTH BUTTON */}
        <View style={styles.authWrapper}>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.authBtn} onPress={handleLogout} activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={16} color="#fff" />
              <Text style={styles.authBtnText}>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.authBtn} onPress={() => navigateTo('/admin/AdminLogin')} activeOpacity={0.85}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
              <Text style={styles.authBtnText}>Admin Login</Text>
            </TouchableOpacity>
          )}
        </View>

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
  compact?: boolean;
};

const MenuItem = React.memo(({ icon, label, onPress, active, compact }: MenuItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.item, active && styles.itemActive, compact && styles.itemCompact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, active && styles.iconBoxActive, compact && styles.iconBoxCompact]}>
        <Ionicons name={icon} size={compact ? 17 : 20} color={active ? '#059669' : '#6B7280'} />
      </View>
      <Text style={[styles.label, active && styles.labelActive, compact && styles.labelCompact]} numberOfLines={1}>
        {label}
      </Text>
      {active && <View style={styles.activeBar} />}
    </TouchableOpacity>
  );
});

/* STYLES */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  card: {
    height: SCREEN_H * 0.90,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginHorizontal: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      }
    })
  },
  profileHeader: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    marginBottom: 4,
  },
  menu: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 2,
    justifyContent: 'space-evenly',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  itemActive: {
    backgroundColor: '#ECFDF5',
  },
  itemCompact: {
    paddingVertical: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  iconBoxActive: {
    backgroundColor: '#C9E8DE',
  },
  iconBoxCompact: {
    width: 32,
    height: 32,
    borderRadius: 9,
    marginRight: 9,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    flex: 1,
  },
  labelActive: {
    color: '#047857',
    fontWeight: '700',
  },
  labelCompact: {
    fontSize: 13.5,
  },
  activeBar: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#059669',
  },
  authWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#064E3B',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    })
  },
  authBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});

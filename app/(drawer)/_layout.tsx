import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAdmin } from '../../src/redux/slice/adminAuthSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

function CustomDrawerContent(props: any) {
  const dispatch = useDispatch();
  const isAdminLoggedIn = useSelector((state: any) => state.adminAuth.isAdminLoggedIn);
  const [activeItem, setActiveItem] = useState('');

  const navigate = (path: string, key?: string) => {
    if (key) setActiveItem(key);
    props.navigation.closeDrawer();
    router.push(path as any);
  };

  const mainItems = [
    { label: 'Home', path: '/Home', icon: require('../../src/assets/drawer/home.png') },
    { label: 'Services', path: '/Service', icon: require('../../src/assets/drawer/services.png') },
    { label: 'Book a Service', path: '/Book', icon: require('../../src/assets/drawer/book.png') },
    { label: 'About Us', path: '/About', icon: require('../../src/assets/drawer/about.png') },
    { label: 'Contact', path: '/Contact', icon: require('../../src/assets/drawer/contact.png') },
  ];

  const extraItems = [
    { label: 'Become a Partner', path: '/Partnership', key: 'partner', icon: require('../../src/assets/drawer/becomeApartner.png') },
    { label: 'Career', path: '/Career', key: 'career', icon: require('../../src/assets/drawer/career.png') },
    { label: 'FAQ', path: '/FAQs', key: 'faq', icon: require('../../src/assets/drawer/faq.png') },
    { label: 'Glossary', path: '/Gossip', key: 'glossary', icon: require('../../src/assets/drawer/glossary.png') },
  ];

  return (
    // Outer transparent fill — covers full drawer container
    <View style={styles.outerContainer}>
      {/* Floating card */}
      <View style={styles.floatingCard}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => props.navigation.closeDrawer()}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <DrawerContentScrollView
          {...props}
          scrollEnabled
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../src/assets/logowithwordmark.png')}
            />
          </View>

          {/* Main nav items */}
          {mainItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.item}
              onPress={() => navigate(item.path)}
            >
              <View style={styles.row}>
                <Image source={item.icon} resizeMode="contain" style={styles.icon} />
                <Text style={styles.label}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Extra items */}
          {extraItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.item, activeItem === item.key && styles.activeItem]}
              onPress={() => navigate(item.path, item.key)}
            >
              <View style={styles.row}>
                <Image
                  source={item.icon}
                  resizeMode="contain"
                  style={[styles.icon, activeItem === item.key && styles.activeIcon]}
                />
                <Text style={[styles.label, activeItem === item.key && styles.activeLabel]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Admin Login / Logout */}
          {!isAdminLoggedIn ? (
            <TouchableOpacity
              onPress={() => {
                props.navigation.closeDrawer();
                router.push('/AdminLogin' as any);
              }}
            >
              <Text style={styles.adminBtn}>Admin Login</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                dispatch(logoutAdmin());
                props.navigation.closeDrawer();
                router.push('/Home' as any);
              }}
            >
              <Text style={styles.adminBtn}>Logout</Text>
            </TouchableOpacity>
          )}
        </DrawerContentScrollView>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: 'transparent',
          width: wp('85%'),
          elevation: 0,
          shadowOpacity: 0,
        },
        overlayColor: 'rgba(0,0,0,0.75)',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    />
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingCard: {
    position: 'absolute',
    left: wp('3%'),
    top: hp('8%'),
    bottom: hp('8%'),
    width: wp('75%'),
    backgroundColor: '#fff',
    borderRadius: wp('6%'),
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: hp('1.2%'),
    right: wp('3%'),
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  closeText: {
    fontSize: hp('1.8%'),
    color: 'hsl(0, 0%, 25%)',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingTop: wp('5%'),
    paddingBottom: hp('3%'),
  },
  logoContainer: {
    width: '100%',
    height: hp('7%'),
    marginBottom: hp('2.5%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'hsl(0, 0%, 80%)',
    paddingBottom: hp('1.5%'),
  },
  logo: {
    width: wp('38%'),
    height: hp('6.5%'),
    resizeMode: 'contain',
  },
  item: {
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('2.5%'),
  },
  activeItem: {
    backgroundColor: 'rgba(47, 111, 94, 0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: hp('1.75%'),
    color: 'hsl(0, 0%, 30%)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: 'green',
    fontWeight: '700',
  },
  icon: {
    width: wp('4.8%'),
    height: wp('4.8%'),
    marginRight: wp('3%'),
    tintColor: '#404040',
  },
  activeIcon: {
    tintColor: 'green',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#797979',
    marginVertical: hp('2%'),
  },
  adminBtn: {
    fontSize: hp('1.7%'),
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: hp('5%'),
    marginLeft: hp('1%'),
    backgroundColor: '#0c742f',
    minWidth: hp('13%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('1.5%'),
    alignSelf: 'flex-start',
  },
});

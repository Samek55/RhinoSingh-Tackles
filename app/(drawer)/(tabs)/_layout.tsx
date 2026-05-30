import { Tabs } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { MagnifyingGlassIcon, ChatCircleTextIcon, AddressBookIcon } from 'phosphor-react-native';
import HomeIcon from '../../../src/assets/topProfessionals/home.svg';
import HomeActiveIcon from '../../../src/assets/topProfessionals/homeActive.svg';
import BookIcon from '../../../src/assets/topProfessionals/booking.svg';
import BookActiveIcon from '../../../src/assets/topProfessionals/bookingActive.svg';

function FabButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ddd',
            height: 100,
            paddingTop: 6,
            paddingBottom: 25,
            borderTopWidth: 0,
            elevation: 12,
          },
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: '#555',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginTop: 3,
          },
          tabBarIcon: ({ focused }) => {
            if (route.name === 'Home') {
              return focused
                ? <HomeActiveIcon height={33} width={33} />
                : <HomeIcon height={33} width={33} color="#555" />;
            }
            if (route.name === 'Service') {
              return (
                <MagnifyingGlassIcon
                  size={32}
                  weight={focused ? 'fill' : 'regular'}
                  color={focused ? 'green' : '#555'}
                />
              );
            }
            if (route.name === 'Book') {
              return focused
                ? <BookActiveIcon height={55} width={55} style={styles.bookingActiveIcon} />
                : <BookIcon height={55} width={55} style={styles.bookingIcon} />;
            }
            if (route.name === 'About') {
              return (
                <ChatCircleTextIcon
                  size={32}
                  weight={focused ? 'fill' : 'regular'}
                  color={focused ? 'green' : '#555'}
                />
              );
            }
            if (route.name === 'Contact') {
              return (
                <AddressBookIcon
                  size={32}
                  weight={focused ? 'fill' : 'regular'}
                  color={focused ? 'green' : '#555'}
                />
              );
            }
            return null;
          },
        })}
      >
        <Tabs.Screen name="Home" options={{ tabBarLabel: 'Home' }} />
        <Tabs.Screen name="Service" options={{ tabBarLabel: 'Services' }} />
        <Tabs.Screen name="Book" options={{ tabBarLabel: '' }} />
        <Tabs.Screen name="About" options={{ tabBarLabel: 'About' }} />
        <Tabs.Screen name="Contact" options={{ tabBarLabel: 'Contact' }} />
      </Tabs>
      <FabButton />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: hp('3.8%'),
    right: wp('14%'),
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('5%'),
    borderWidth: 1,
    backgroundColor: '#058610',
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 10,
  },
  menuIcon: {
    fontSize: hp('2.3%'),
    color: '#fff',
    fontWeight: '700',
  },
  bookingIcon: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  bookingActiveIcon: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
});

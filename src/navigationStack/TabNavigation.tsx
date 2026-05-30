import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

import Booking from './Booking';
import Home from './ScreensNAV/Home';
import Services from './ScreensNAV/Services';
import About from './ScreensNAV/About';
import Contact from './ScreensNAV/Contact';

import Career from './ScreensNAV/Career';
import Glossary from './ScreensNAV/Glossary'
import Partner from './ScreensNAV/Partner';
import Faqs from './ScreensNAV/Faqs';
import AdminNavigation from './authNAV/AdminNavigation'
import HomeIcon from '../assets/topProfessionals/home.svg';
import HomeActiveIcon from '../assets/topProfessionals/homeActive.svg';
import BookActiveIcon from '../assets/topProfessionals/bookingActive.svg'
import BookIcon from '../assets/topProfessionals/booking.svg'

import {
  AddressBookIcon,
  ChatCircleTextIcon,
  MagnifyingGlassIcon
} from 'phosphor-react-native';
const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#ddd',
          height: 100,
          paddingTop: 6,
          paddingBottom: 25,
          borderTopWidth: 0,
          elevation: 12,
          // paddingHorizontal: 15,
        },

        tabBarIcon: ({ focused }) => {
          return (
            <View style={styles.iconContainer}>

              {/* Active top line */}
              {/* {focused && <View style={styles.activeLine} />} */}

              {route.name === 'Home' ? (
                focused ? (
                  <HomeActiveIcon height={33} width={33} style={styles.ActiveIcon} />
                ) : (
                  <HomeIcon height={33} width={33} color="#555" />
                )
              ) : route.name === 'Services' ? (
                focused ? (
                  <MagnifyingGlassIcon
                    size={32}
                    weight='fill'
                    color="green"
                    style={styles.ActiveIcon}
                  />
                ) : (
                  <MagnifyingGlassIcon
                    size={32}
                    color="#555"
                    style={styles.NIcon}
                  />
                )
              ) : route.name === 'BookingTab' ? (
                focused ? (
                  <BookActiveIcon
                    height={55}
                    width={55}
                    style={styles.bookingActiveIcon}
                  />
                ) : (
                  <BookIcon
                    height={55}
                    width={55}
                    style={styles.bookingIcon}
                  />
                )
              ) : route.name === 'Request' ? (
                focused ? (
                  <ChatCircleTextIcon
                    size={32}
                    color="green"
                    weight='fill'
                    style={styles.ActiveIcon}
                  />
                ) : (
                  <ChatCircleTextIcon
                    size={32}
                    color="#555"
                    style={styles.NIcon}
                  />
                )
              ) : route.name === 'Contact' ? (
                focused ? (
                  <AddressBookIcon
                    size={32}
                    color="green"
                    weight='fill'
                    style={styles.ActiveIcon}
                  />
                ) : (
                  <AddressBookIcon
                    size={32}
                    color="#555"
                    style={styles.NIcon}
                  />
                )
              ) : null}
            </View>
          );
        },

        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: '#555',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 3,

        },
      })}>

      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Home', }} />
      <Tab.Screen name="Services" component={Services} options={{ tabBarLabel: 'Services' }} />
      <Tab.Screen name="BookingTab" component={Booking} options={{ tabBarLabel: ''}} />
      <Tab.Screen name="Request" component={About} options={{ tabBarLabel: 'About' }} />
      <Tab.Screen name="Contact" component={Contact} options={{ tabBarLabel: 'Contact' }} />
      <Tab.Screen
        name="Partner"
        component={Partner}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="Faqs"
        component={Faqs}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="Career"
        component={Career}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="Glossary"
        component={Glossary}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="AdminLogin"
        component={AdminNavigation}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          tabBarStyle: { display: 'none' },
        }}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  NIcon: {

    marginTop: 2,

  },

  ActiveIcon: {
    marginTop: 2,
  },

  bookingIcon: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 100,


    // Android shadow
    boxShadow: '0px 0px 2px 4px #fff',

  },
  bookingActiveIcon: {

    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 100,


    // Android shadow
    boxShadow: '0px 0px 2px 4px #fff',

  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeLine: {
    position: 'absolute',
    top: -10,
    width: 35,
    height: 3,
    borderRadius: 10,
    backgroundColor: 'green',
  },
});

export default Tabs;

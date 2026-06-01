import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'green',   
        tabBarInactiveTintColor: 'gray', 
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Service"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="service/ServiceDetail"
        options={{
         headerShown:false,
          href: null,
        }}
      />

      <Tabs.Screen
        name="Book"
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => {
            return (
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  onPress={props.onPress}
                  onLongPress={props.onLongPress ?? undefined}
                  activeOpacity={0.85}
                  style={styles.floatingButton}
                >
                  <Ionicons name="add-circle-outline" size={60} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />

       <Tabs.Screen
        name="booking/BookingDetail"
        options={{
         headerShown:false,
          href: null,
        }}
      />

        <Tabs.Screen
        name="booking/BookingOtp"
        options={{
         headerShown:false,
          href: null,
        }}
      />

        <Tabs.Screen
        name="booking/BookingVerify"
        options={{
         headerShown:false,
          href: null,
        }}
      />

      <Tabs.Screen
        name="About"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Contact"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="call-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    width: 65,
    height: 65,
    borderRadius: 45,
    backgroundColor: '#008000',

    justifyContent: 'center',
    alignItems: 'center',

    top: -15, 

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
})
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Image, Text } from "react-native";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        headerShown: true,

        header: () => (
          <View
            style={{
              height: 85,
              paddingHorizontal: 16,
              paddingTop: 35,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F7F7F7",

              // ✨ modern shadow
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            {/* LEFT SIDE */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Image
                source={require("../../assets/images/icon.png")}
                style={{
                  width: 36,
                  height: 36,
                  resizeMode: "contain",
                  borderRadius: 8,
                }}
              />

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#14461e",
                  letterSpacing: 0.5,
                }}
              >
                ROCKETSINGH
              </Text>
            </View>

            {/* RIGHT SIDE */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Optional icon */}
              <Image
                source={require("../../assets/header/right.png")}
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: "contain",
                  opacity: 0.8,
                }}
              />

              {/* Menu Button */}
              <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
                activeOpacity={0.7}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  justifyContent: "center",
                  alignItems: "center",

                  borderWidth: 1,
                  borderColor: "#EAEAEA",
                }}
              >
                <Ionicons name="menu" size={24} color="#111" />
              </TouchableOpacity>
            </View>
          </View>
        ),
      })}
    >

      <Drawer.Screen
        name="FAQs"
        options={{
          title: 'FAQs',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Glossary"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Partnership"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Career"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Admin"
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="AdminChangePassword"
        options={{ drawerItemStyle: { display: 'none' } }}
      />


    </Drawer>
  );
}
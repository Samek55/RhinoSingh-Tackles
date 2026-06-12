import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity, // Added for custom responsive styling
  Text,             // Added to style button labels
} from "react-native";

import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../../src/firebase/firebaseConfig";
import { router } from "expo-router";
import Header4 from "@/components/Header4Admin";

type Role = "admin" | "career" | "user";

export default function CreateUser() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("admin");

  const createUser = async () => {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
      const cleanPin = pin.replace(/[^0-9]/g, "");

      // ✅ STRICT VALIDATION
      if (cleanPhone.length !== 10) {
        Alert.alert("Error", "Phone number must be exactly 10 digits");
        return;
      }

      if (cleanPin.length !== 6) {
        Alert.alert("Error", "PIN must be exactly 6 digits");
        return;
      }

      const email = `${cleanPhone}@tackles.app`;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        cleanPin
      );

      const user = userCredential.user;

      // 🔥 OneSignal setup
      try {
        const { OneSignal } = require("react-native-onesignal");

        OneSignal.login(user.uid);

        OneSignal.User.addTags({
          role: selectedRole, // ONLY: admin | career | user
        });
      } catch (e) {
        console.warn("OneSignal error:", e);
      }

      Alert.alert("Success", `${selectedRole} created successfully`);

      setPhoneNumber("");
      setPin("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      try {
        const { OneSignal } = require("react-native-onesignal");
        OneSignal.logout();
      } catch (e) {
        console.warn("OneSignal logout error:", e);
      }

      Alert.alert("Logged Out", "You have been logged out.", [
        {
          text: "OK",
          onPress: () => router.replace("/admin/AdminLogin"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header4 />
      <View style={styles.container}>
        <View style={styles.box}>

          {/* PHONE */}
          <TextInput
            placeholder="Phone Number (10 digits)"
            value={phoneNumber}
            keyboardType="number-pad"
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "");
              setPhoneNumber(cleaned.slice(0, 10)); // limit 10
            }}
            style={styles.input}
          />

          {/* PIN */}
          <TextInput
            placeholder="PIN (6 digits)"
            value={pin}
            secureTextEntry
            keyboardType="number-pad"
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "");
              setPin(cleaned.slice(0, 6)); // limit 6
            }}
            style={styles.input}
          />

          {/* ROLE SELECT - FIXED TO VISUALLY RESPOND */}
          <View style={styles.roleRow}>
            {(["admin", "career", "user"] as Role[]).map((role) => {
              const isActive = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={[
                    styles.roleButton,
                    isActive ? styles.activeRoleButton : styles.inactiveRoleButton
                  ]}
                >
                  <Text style={[styles.roleText, isActive && styles.activeRoleText]}>
                    {role.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ACTIONS */}
          <Button title={`Create ${selectedRole}`} onPress={createUser} color="green" />
          <Button title="Logout" onPress={handleLogout} color="red" />

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  box: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    gap: 6,
  },
  // New Styles added below for responsive touch feedback
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  activeRoleButton: {
    backgroundColor: "green",
    borderColor: "green",
  },
  inactiveRoleButton: {
    backgroundColor: "#e0e0e0",
    borderColor: "#ccc",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  activeRoleText: {
    color: "#fff",
  },
});
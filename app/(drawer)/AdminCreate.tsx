import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { signOut } from "@firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig"; // adjust path


export default function CreateAdmin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);

      try {
        const { OneSignal } = require('react-native-onesignal');
        OneSignal.logout();
      } catch (e) {
        console.warn('OneSignal clean-up failure:', e);
      }

      Alert.alert(
        "Logged Out",
        "You have been logged out successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace('/admin/AdminLogin');
            }
          }
        ]
      );

    } catch (error: any) {
      alert("Logout error: " + error.message);
    }
  };


  const createAdmin = async () => {
    try {
      if (!phoneNumber || !pin) {
        Alert.alert("Error", "Please enter phone number and PIN");
        return;
      }

      if (pin.length < 6) {
        Alert.alert("Error", "PIN must be at least 6 digits");
        return;
      }

      // Generate the internal dummy email needed for Firebase Email/Password auth
      const email = `${phoneNumber}@tackles.app`;

      // Create the user inside Firebase Auth only
      await createUserWithEmailAndPassword(auth, email, pin);

      Alert.alert("Success", "Admin created successfully");
      setPhoneNumber("");
      setPin("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          placeholder="PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          style={styles.input}
        />

        <Button title="Create Admin" onPress={createAdmin} />
        <Button title="Go Back" onPress={handleLogout} color="red" />
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
});
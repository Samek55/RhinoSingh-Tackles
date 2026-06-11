import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig"; // adjust path
import { router } from "expo-router";


export default function CreateAdmin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  const createAdmin = async () => {
    try {
      if (!phoneNumber || !pin) {
        Alert.alert("Error", "Please enter phone number and PIN");
        return;
      }
      // 👉 PUT THIS HERE
    if (pin.length < 6) {
      Alert.alert("Error", "PIN must be at least 6 digits");
      return;
    }


      const email = `${phoneNumber}@tackles.app`;

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
        <Button title="Go Back" onPress={()=> router.push('/Admin')}  color="red"  />
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
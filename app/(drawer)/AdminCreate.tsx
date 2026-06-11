import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig"; // adjusted path
import { router } from "expo-router";
import { OneSignal } from "react-native-onesignal";

type Role = "admin" | "user" | "career";

export default function CreateAdmin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("admin");

  const createAdmin = async () => {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const cleanPin = pin.replace(/[^0-9]/g, '');

      if (!cleanPhone || !cleanPin) {
        Alert.alert("Error", "Please enter phone number and PIN");
        return;
      }

      if (cleanPhone.length !== 10) {
        Alert.alert("Error", "Phone number must be exactly 10 digits");
        return;
      }

      if (cleanPin.length !== 6) {
        Alert.alert("Error", "PIN must be exactly 6 digits");
        return;
      }

      const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+977${cleanPhone}`;
      const email = `${cleanPhone}@tackles.app`;

      // 1. Save the current Admin's logged-in status if necessary, or prepare for tracking isolation
      // Creating an account logs the app out of the current user session in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, cleanPin);
      const newUser = userCredential.user;

      if (newUser) {
        console.log(`[Admin Action] Synchronizing OneSignal Data Channels for Identity: ${newUser.uid}`);
        
        // This targets the new user's profile identity space in OneSignal
        OneSignal.login(newUser.uid);
        
        // Setting up requested data communication channels safely
        OneSignal.User.addEmail(email);
        OneSignal.User.addSms(formattedPhone);

        // Assign core identification tags
        OneSignal.User.addTags({
          role: selectedRole,
          phone: cleanPhone // Added to match the string tag profile seen in User 2
        });

        // Small delay allowing async event propagation to clear gracefully
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // OPTIONAL: Logout of OneSignal on this device if you don't want the Admin device 
        // to inherit the newly created user's push subscriptions.
        // with this i will be able to use the account i created in this subscribtion of oneSignal
        OneSignal.logout(); 
      }

      // Reset form states cleanly
      setPhoneNumber("");
      setPin("");

      // Trigger user verification modal
      Alert.alert(
        "Success",
        `${selectedRole} created successfully`,
        [
          {
            text: "OK",
            onPress: () => router.push('/Admin') 
          }
        ]
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.box}>
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={(value) => {
              const cleaned = value.replace(/[^0-9]/g, '');
              setPhoneNumber(cleaned.slice(0, 10));
            }}
            keyboardType="number-pad"
            style={styles.input}
          />

          <TextInput
            placeholder="PIN"
            value={pin}
            onChangeText={(value) => {
              const cleaned = value.replace(/[^0-9]/g, '');
              setPin(cleaned.slice(0, 6));
            }}
            secureTextEntry
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Select Role:</Text>
          <View style={styles.roleContainer}>
            {(["admin", "user", "career"] as Role[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  selectedRole === role && styles.roleButtonActive,
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === role && styles.roleButtonTextActive,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonSpacing} />

          <Button title={`Create ${selectedRole}`} onPress={createAdmin} />
          <Button title="Go Back" onPress={() => router.push('/Admin')} color="red" />
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
    marginBottom: -4,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginVertical: 4,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: "green",
    backgroundColor: "#ebffef",
  },
  roleButtonText: {
    fontSize: 14,
    color: "#555",
    textTransform: "lowercase",
  },
  roleButtonTextActive: {
    color: "green",
    fontWeight: "700",
  },
  buttonSpacing: {
    height: 4,
  }
});
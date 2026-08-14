import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import Header5 from "@/components/Header5Admin";
import { supabase } from "@/src/lib/supabase";
import { invokeEdgeFunction } from "@/api/adminFunctionsClient";
import { logoutAdmin } from "@/api/supabase/adminAuth";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function CreateProfessional() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCareerData = async (phone: string) => {
    const { data, error } = await supabase
      .from("workforce")
      .select("full_name")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.log("Supabase career fetch error:", error);
      throw new Error("Failed to verify user status in the Career database.");
    }

    return data;
  };

  const createUser = async () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");

    if (cleanPhone.length !== 10) {
      Alert.alert("Error", "Phone number must be exactly 10 digits");
      return;
    }

    setIsLoading(true);

    try {
      const careerRecord = await fetchCareerData(cleanPhone);

      if (!careerRecord) {
        Alert.alert("Access Denied", "Please fill up the career form first.");
        return;
      }

      // No PIN collected here — a superadmin approves the application
      // (UserManagement's Professionals... err, Admins tab), which is what
      // actually generates and SMS's the login PIN. A Pending applicant
      // can't be trusted with a PIN nobody's told them yet.
      const result = await invokeEdgeFunction<{ success: boolean; message?: string; status?: string }>(
        'admin-create',
        { phone: cleanPhone, fullName: careerRecord.full_name },
        'Could not submit application'
      );

      if (!result.success) {
        Alert.alert("Error", result.message || "Could not submit application");
        return;
      }

      Alert.alert("Application Submitted", "Your account is awaiting superadmin approval. You'll receive an SMS with your login PIN once approved.");

      setPhoneNumber("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();

      // Safe Native Guard for Dynamic Logout Module
      try {
        const OneSignalModule = require("react-native-onesignal");
        const OneSignal = OneSignalModule.OneSignal || OneSignalModule.default;
        if (OneSignal && typeof OneSignal.logout === "function") {
          OneSignal.logout();
        }
      } catch (e) {
        console.warn("OneSignal logout error bypassed safely:", e);
      }

      router.replace("/admin/AdminLogin");
    } catch (error: any) {
      console.warn("Logout Error:", error.message);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header5 />
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={Keyboard.dismiss}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Header Typography Elements */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.titleText}>Create Professional Account</Text>
              <Text style={styles.subtitleText}>
                Enter the phone number you used on the career application. A superadmin will approve your account and text you a login PIN.
              </Text>
            </View>

            {/* PHONE INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                placeholder="Enter 10-digit number"
                placeholderTextColor="#94a3b8"
                value={phoneNumber}
                keyboardType="number-pad"
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, "");
                  setPhoneNumber(cleaned.slice(0, 10));
                }}
                style={styles.input}
                maxLength={10}
              />
            </View>

            {/* ACTIONS */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={createUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Submit Application</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
              <Text style={styles.secondaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>


        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 28,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  headerTextContainer: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    fontSize: 15,
    color: "#0f172a",
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#86efac",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    borderWidth:1,
    borderColor:'rgba(0, 0, 0,0.2)'
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ef4444",
  },
});

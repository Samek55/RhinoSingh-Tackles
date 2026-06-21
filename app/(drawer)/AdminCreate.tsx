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

import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../../src/firebase/firebaseConfig";
import { router } from "expo-router";
import Header5 from "@/components/Header5Admin";
import { getDatabase, ref, set } from "firebase/database";
import { supabase } from "@/src/lib/supabase";

type Role = "admin" | "career" | "user";
const db = getDatabase();

let servicesCache: Record<string, string> | null = null;
let servicesPromise: Promise<Record<string, string>> | null = null;

const fetchServicesMap = async () => {
  try {
    if (servicesCache) return servicesCache;
    if (servicesPromise) return servicesPromise;

    servicesPromise = (async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name");

      if (error) {
        console.error("Supabase services fetch error:", error);
        throw error;
      }

      const map: Record<string, string> = {};
      data?.forEach((item: any) => {
        const id = item.id;
        const name = item.name;
        if (id && name) {
          map[id] = name;
        }
      });

      servicesCache = map;
      return map;
    })();

    return await servicesPromise;
  } catch (error) {
    console.log("Services map fetch error:", error);
    return {};
  }
};

export default function CreateUser() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔐 FORCED TO "career" DEFAULT BUT LOGICS REMAIN INTACT
  const [selectedRole] = useState<Role>("career");

  const fetchCareerData = async (phone: string) => {
    const { data, error } = await supabase
      .from("workforce")
      .select("*")
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
    const cleanPin = pin.replace(/[^0-9]/g, "");

    if (cleanPhone.length !== 10) {
      Alert.alert("Error", "Phone number must be exactly 10 digits");
      return;
    }

    if (cleanPin.length !== 6) {
      Alert.alert("Error", "PIN must be exactly 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      let localizedServiceNames: string[] = [];
      let preferredAreaValues: string[] = [];

      // 🔍 STRICT CHECK: Only check Supabase if role is exactly "career"
      if (selectedRole === "career") {
        const careerRecord = await fetchCareerData(cleanPhone);

        if (!careerRecord) {
          Alert.alert("Access Denied", "Please fill up the career form first.");
          setIsLoading(false);
          return;
        }

        const servicesMap = await fetchServicesMap();

        // Adapting field cases to typical PostgreSQL/Supabase snake_case conventions
        const expertiseIds: string[] = Array.isArray(careerRecord["area_of_expertise"])
          ? careerRecord["area_of_expertise"]
          : careerRecord["area_of_expertise"]
            ? [careerRecord["area_of_expertise"]]
            : [];

        preferredAreaValues = Array.isArray(careerRecord["preferred_working_area"])
          ? careerRecord["preferred_working_area"]
          : careerRecord["preferred_working_area"]
            ? [careerRecord["preferred_working_area"]]
            : [];

        localizedServiceNames = expertiseIds
          .map((id) => servicesMap[id] || id)
          .filter(Boolean);
      }

      // 🔐 Firebase Setup
      const email = `${cleanPhone}@rocketsingh.app`;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        cleanPin
      );

      const user = userCredential.user;

      if (!user?.uid) {
        throw new Error("Auth failed - no UID generated");
      }

      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        phone: cleanPhone,
        role: selectedRole,
        services: localizedServiceNames,   // mapped via services table
        area: preferredAreaValues,
        createdAt: Date.now(),
      });

      // 🔥 Conditional OneSignal Registration
      try {
        const { OneSignal } = require("react-native-onesignal");
        OneSignal.login(user.uid);

        if (selectedRole === "user") {
          OneSignal.User.addTags({
            phone: cleanPhone,
            role: "user",
          });
        } else if (selectedRole === "admin") {
          OneSignal.User.addTags({
            role: "admin",
          });
        } else if (selectedRole === "career") {
          OneSignal.User.addTags({
            role: "career",
            phone: cleanPhone,
          });
        }
      } catch (e) {
        console.warn("OneSignal tag setup error:", e);
      }

      Alert.alert("Success", `${selectedRole} created successfully`);

      setPhoneNumber("");
      setPin("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
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
              <Text style={styles.titleText}>Create Career Account</Text>
              <Text style={styles.subtitleText}>
                Register a new career portal credential with a phone number and secure PIN.
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
              />
            </View>

            {/* PIN INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Security PIN</Text>
              <TextInput
                placeholder="Enter 6-digit PIN"
                placeholderTextColor="#94a3b8"
                value={pin}
                secureTextEntry
                keyboardType="number-pad"
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, "");
                  setPin(cleaned.slice(0, 6));
                }}
                style={styles.input}
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
                <Text style={styles.primaryButtonText}>Create Career Account</Text>
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
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ef4444",
  },
});
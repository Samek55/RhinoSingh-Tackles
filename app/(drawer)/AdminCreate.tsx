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

import { auth, getSecondaryAuth } from "../../src/firebase/firebaseConfig";
import { router } from "expo-router";
import Header5 from "@/components/Header5Admin";
import { getDatabase, ref, set } from "firebase/database";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useRequireSuperAdmin } from "@/hooks/useRequireSuperAdmin";

type Role = "admin" | "career" | "user";
const db = getDatabase();

export default function CreateAdmin() {
    const authorized = useRequireSuperAdmin();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 🔐 FORCED TO "admin" DEFAULT PER CLIENT REQUIREMENT
    const [selectedRole] = useState<Role>("admin");

    if (!authorized) {
        return null;
    }

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
            // 🔐 Firebase Setup — created on an isolated secondary auth instance so this
            // doesn't sign the current superadmin out of their own session (see
            // getSecondaryAuth's comment in firebaseConfig.js).
            const email = `${cleanPhone}@rocketsingh.app`;
            const secondaryAuth = getSecondaryAuth();

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                email,
                cleanPin
            );

            const user = userCredential.user;

            if (!user?.uid) {
                throw new Error("Auth failed - no UID generated");
            }

            // Save direct to database without waiting for career lookups
            await set(ref(db, `users/${user.uid}`), {
                uid: user.uid,
                phone: cleanPhone,
                role: selectedRole,
                services: [],
                area: [],
                createdAt: Date.now(),
            });

            // End the secondary session immediately — it only ever exists to run the
            // createUserWithEmailAndPassword call above without touching the caller's own.
            await signOut(secondaryAuth);

            // 🔥 Conditional OneSignal Registration with Admin Payload Mapping
            try {
                const OneSignalModule = require("react-native-onesignal");
                const OneSignal = OneSignalModule.OneSignal || OneSignalModule.default;

                if (OneSignal && typeof OneSignal.login === "function") {
                    OneSignal.login(user.uid);

                    if (OneSignal.User?.addTags) {
                        OneSignal.User.addTags({
                            role: "admin",
                            phone: cleanPhone,
                        });
                    }
                }
            } catch (e) {
                console.warn("OneSignal tag setup error bypassed safely:", e);
            }

            Alert.alert("Success", `${selectedRole} account created successfully`);

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
                            <Text style={styles.titleText}>Create Admin Account</Text>
                            <Text style={styles.subtitleText}>
                                Register a new admin portal credential instantly with a phone number and secure PIN.
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
                                maxLength={6}
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
                                <Text style={styles.primaryButtonText}>Create Admin Account</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
                            <Text style={styles.secondaryButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: hp('2%') }}>
                        <Text
                            onPress={() => router.push('/ProfessionalCreate')}
                            style={{ marginBottom: 5, fontWeight: '700', color: '#0b176f' }}>
                            Create Professional Account
                        </Text>
                        <Text
                            onPress={() => router.push('/SuperAdminCreate')}

                            style={{ fontWeight: '700', color: '#0b176f' }}>
                            Create SuperAdmin Account
                        </Text>
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
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0,0.2)'
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#ef4444",
    },
});
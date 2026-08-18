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
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useRequireSuperAdmin } from "@/hooks/useRequireSuperAdmin";
import { invokeEdgeFunction } from "@/api/adminFunctionsClient";
import { logoutAdmin } from "@/api/supabase/adminAuth";

export default function CreateSuperAdmin() {
    const authorized = useRequireSuperAdmin();
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 🔐 FORCED TO "superadmin" DEFAULT FOR HIGH-LEVEL ORCHESTRATION
    const [selectedRole] = useState<string>("superadmin");

    if (!authorized) {
        return null;
    }

    const createUser = async () => {
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
        const cleanPin = pin.replace(/[^0-9]/g, "");

        if (!fullName.trim()) {
            Alert.alert("Error", "Full name is required");
            return;
        }

        if (cleanPhone.length !== 10) {
            Alert.alert("Error", "Phone number must be exactly 10 digits");
            return;
        }

        if (cleanPin.length !== 4) {
            Alert.alert("Error", "PIN must be exactly 4 digits");
            return;
        }

        setIsLoading(true);

        try {
            const result = await invokeEdgeFunction<{ success: boolean; message?: string }>(
                'admin-create',
                { phone: cleanPhone, fullName: fullName.trim(), pin: cleanPin, role: selectedRole },
                'Could not create account',
                { requireSession: true }
            );

            if (!result.success) {
                Alert.alert("Error", result.message || "Could not create account");
                return;
            }

            Alert.alert("Success", `${selectedRole} account created successfully`);

            setFullName("");
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
                            <Text style={styles.titleText}>Create SuperAdmin Account</Text>
                            <Text style={styles.subtitleText}>
                                Register a new elevated superadmin root account instantly with a phone number and secure PIN.
                            </Text>
                        </View>

                        {/* FULL NAME INPUT */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                placeholder="Enter full name"
                                placeholderTextColor="#94a3b8"
                                value={fullName}
                                onChangeText={setFullName}
                                style={styles.input}
                            />
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
                                placeholder="Enter 4-digit PIN"
                                placeholderTextColor="#94a3b8"
                                value={pin}
                                secureTextEntry
                                keyboardType="number-pad"
                                onChangeText={(v) => {
                                    const cleaned = v.replace(/[^0-9]/g, "");
                                    setPin(cleaned.slice(0, 4));
                                }}
                                style={styles.input}
                                maxLength={4}
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
                                <Text style={styles.primaryButtonText}>Create SuperAdmin Account</Text>
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
                            onPress={() => router.push('/AdminCreate')}
                            style={{ fontWeight: '700', color: '#0b176f' }}>
                            Create Admin Account
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
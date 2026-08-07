import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header4 from "@/components/Header4Admin";
import { useRequireRole } from "@/hooks/useRequireRole";

const FILTERS = ["All", "Today", "Earlier"];

export default function ViewNotification() {
  const { authorized } = useRequireRole(['career', 'admin', 'superadmin']);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { width } = useWindowDimensions();

  if (!authorized) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <Header4 />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        
        {/* Date Filters: Wrapped in a horizontal ScrollView for smaller screens */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, selectedFilter === filter && styles.activeChip]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={selectedFilter === filter ? styles.activeChipText : styles.chipText}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content area: Scrollable to prevent content being cut off */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPadding}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={24} color="#007AFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>System Update</Text>
                <Text style={styles.timestamp}>Today, 10:30 AM</Text>
              </View>
            </View>
            <View style={styles.body}>
              <Text style={styles.message}>
                Your application has been successfully updated to version 2.0.1.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F2F2F7" },
  safeArea: { flex: 1 },
  contentPadding: { padding: "4%" },
  
  filterScrollView: {
    maxHeight: 60, // Limit height to keep layout tight
    paddingHorizontal: "4%",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
  },
  activeChip: { backgroundColor: "#007AFF" },
  chipText: { color: "#3A3A3C", fontWeight: "600", fontSize: 14 },
  activeChipText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "5%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconContainer: { 
    marginRight: 12, 
    backgroundColor: "#E1F0FF", 
    padding: 10, 
    borderRadius: 10 
  },
  headerText: { flex: 1 }, // Ensures title doesn't overflow
  title: { fontSize: 16, fontWeight: "bold", color: "#1C1C1E" },
  timestamp: { fontSize: 12, color: "#8E8E93" },
  body: { borderTopWidth: 1, borderTopColor: "#F2F2F7", paddingTop: 12 },
  message: { fontSize: 14, color: "#3A3A3C", lineHeight: 22 },
});
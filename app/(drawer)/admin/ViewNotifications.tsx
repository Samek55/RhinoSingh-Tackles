import { useCallback, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import Header4 from "@/components/Header4Admin";
import { useRequireRole } from "@/hooks/useRequireRole";
import { invokeEdgeFunction } from "@/api/adminFunctionsClient";

const FILTERS = ["All", "Today", "Earlier"];

type NotificationRow = {
  id: number;
  title: string | null;
  body: string | null;
  audience: string | null;
  audience_service: string | null;
  audience_city: string | null;
  created_at: string;
};

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatTimestamp(isoDate: string): string {
  const d = new Date(isoDate);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return isToday(isoDate) ? `Today, ${time}` : `${d.toLocaleDateString()}, ${time}`;
}

export default function ViewNotification() {
  const { authorized } = useRequireRole(['career', 'admin', 'superadmin']);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await invokeEdgeFunction<{ success: boolean; notifications?: NotificationRow[] }>(
      'list-notifications',
      {},
      'Could not load notifications',
      { requireSession: true }
    );
    setNotifications(data?.success ? data.notifications ?? [] : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (authorized) load();
    }, [authorized, load])
  );

  if (!authorized) {
    return null;
  }

  const filtered = notifications.filter((n) => {
    if (selectedFilter === 'Today') return isToday(n.created_at);
    if (selectedFilter === 'Earlier') return !isToday(n.created_at);
    return true;
  });

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
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>No notifications to show.</Text>
          ) : (
            filtered.map((n) => (
              <View key={n.id} style={styles.card}>
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="notifications" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.title}>{n.title || 'Notification'}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(n.created_at)}</Text>
                  </View>
                </View>
                <View style={styles.body}>
                  <Text style={styles.message}>{n.body || 'No message content.'}</Text>
                  {(n.audience || n.audience_service || n.audience_city) && (
                    <Text style={styles.meta}>
                      {[n.audience, n.audience_service, n.audience_city].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
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

  emptyText: { textAlign: "center", marginTop: 40, color: "#8E8E93" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "5%",
    marginBottom: 12,
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
  meta: { fontSize: 12, color: "#8E8E93", marginTop: 6 },
});

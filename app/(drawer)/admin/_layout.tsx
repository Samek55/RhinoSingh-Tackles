import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Notice the change from <Screen> to <Stack.Screen> */}
      <Stack.Screen name="AdminLogin" options={{ title: 'Admin Login' }} />
      <Stack.Screen name="BookingDetails_1" />
      <Stack.Screen name="BookingDetails_2" />
      <Stack.Screen name="BookingHistory" />
      <Stack.Screen name="ViewNotifications" />
    </Stack>
  );
}
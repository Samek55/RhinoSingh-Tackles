import { Stack } from 'expo-router';

export default function ProfessionalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfessionalLogin" />
      <Stack.Screen name="ProfessionalPinReset" />
      <Stack.Screen name="MyLeads" />
      <Stack.Screen name="LeadDetail" />
      <Stack.Screen name="LeadPayment" />
    </Stack>
  );
}

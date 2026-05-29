import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
      }}>
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="Service" />
      <Tabs.Screen name="Book" />
      <Tabs.Screen name="About" />
      <Tabs.Screen name="Contact" />
    </Tabs>
  );
}
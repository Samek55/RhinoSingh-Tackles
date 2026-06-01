import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

type Route = '/Home' | '/onboarding1';

export default function Index() {
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    const check = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');

      if (seen === 'true') {
        setRoute('/Home');
      } else {
        setRoute('/onboarding1');
      }
    };

    check();
  }, []);

  if (!route) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={route} />;
}
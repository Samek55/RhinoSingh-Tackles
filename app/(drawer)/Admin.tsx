import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Admin() {
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('adminSessionToken').then((token) => {
        router.replace(token ? "/admin/BookingHistory" : "/admin/AdminLogin");
      });
    }, [])
  );

  return null;
}

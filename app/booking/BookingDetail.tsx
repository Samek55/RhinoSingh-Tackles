import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function BookingDetails() {


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Booking Confirmation</Text>
      <Pressable
        onPress={() => router.push('/booking/BookingOtp')}
        style={styles.button}
      >
        <Text style={{ color: 'white' }} >go to Booking otp</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 30,
    backgroundColor: 'green'
  },
  container: {
    flex: 1,                 // take full screen
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
    borderWidth: 2,
  },
  text: {
    textAlign: 'center',
  },
});
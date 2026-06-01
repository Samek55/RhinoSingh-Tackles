import { sendOtp } from "@/api/otp";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";

export default function BookingDetails() {
  const {
    name,
    number,
    selectedService,
    selectedShift,
    selectedArea,
    selectedPriority,
    selectedBudget,
    message,
    date,
  } = useLocalSearchParams();

  const handleSubmit = async () => {
    const formattedPhone = '+977' + number;

    const res = await sendOtp(formattedPhone);

    if (!res?.success) {
      Alert.alert('Error', 'Failed to send OTP');
      return;
    }
    try {

      router.push({
        pathname: '/booking/BookingOtp',
        params: {
          name,
          number,
          selectedService,
          selectedShift,
          selectedArea,
          selectedPriority,
          selectedBudget,
          message,
          date
        },
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.textmain}>Booking Confirmation</Text>
      <Text style={styles.text}>Name: {name}</Text>
      <Text style={styles.text}>Number: {number}</Text>
      <Text style={styles.text}>Selected service: {selectedService}</Text>
      <Text style={styles.text}>Selected Shifts: {selectedShift}</Text>
      <Text style={styles.text}>Area: {selectedArea}</Text>
      <Text style={styles.text}>Priority: {selectedPriority}</Text>
      <Text style={styles.text}>Budget: {selectedBudget}</Text>
      <Text style={styles.text}>Message: {message}</Text>
      <Text style={styles.text}>Date: {date}</Text>

      <Pressable
        onPress={handleSubmit}
        style={styles.button}
      >
        <Text style={{ color: 'white' }} >go to Booking otp - ACCEPT</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/Book')}
        style={styles.button}
      >
        <Text style={{ color: 'white' }} >go to booking</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 30,
    backgroundColor: 'green',
    marginBottom: 20
  },
  container: {
    flex: 1,                 // take full screen
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
    borderWidth: 2,
  },
  textmain: {
    textAlign: 'center',
    fontSize: 20
  },
  text: {
    textAlign: 'center',
  },
});
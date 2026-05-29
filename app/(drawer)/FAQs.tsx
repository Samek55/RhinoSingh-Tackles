import { View, Text, StyleSheet } from 'react-native';

export default function FAQsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FAQs Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
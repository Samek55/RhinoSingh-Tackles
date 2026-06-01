import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const CustomInput = () => {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      
      {value.length === 0 && !focused && (
        <Text style={styles.placeholder}>
          Phone Number
        </Text>
      )}

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },

  placeholder: {
    position: 'absolute',
    left: 10,
    fontSize: 12, // 👈 CUSTOM PLACEHOLDER SIZE
    color: 'rgba(67,67,67,0.4)',
  },

  input: {
    fontSize: 20, // 👈 INPUT TEXT SIZE (DIFFERENT)
    paddingLeft: 10,
  },
});
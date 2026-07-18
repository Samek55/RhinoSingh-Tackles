import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  multiline?: boolean;
  height?: number;
  keyboardType?: KeyboardTypeOptions;
  value?: string;
  onChangeText?: (text: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  placeholder, 
  multiline = false, 
  height = 48, 
  keyboardType = "default", 
  value, 
  onChangeText 
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput 
      style={[
        styles.input, 
        { height: height }, 
        multiline && { paddingTop: 12 }
      ]} 
      placeholder={placeholder} 
      placeholderTextColor="#aaa" 
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      keyboardType={keyboardType}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: { marginTop: 20 },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#444', 
    marginBottom: 8, 
    textTransform: 'uppercase' 
  },
  input: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    fontSize: 14 
  },
});

export default InputField;
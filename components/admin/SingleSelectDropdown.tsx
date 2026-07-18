import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, FlatList, 
  StyleSheet, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SingleSelectDropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  showCustomInput?: boolean;
  customValue?: string;
  onCustomChange?: (text: string) => void;
}

const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({ 
  label, 
  options, 
  selectedValue, 
  onSelect, 
  placeholder,
  showCustomInput = false,
  customValue = '',
  onCustomChange
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedValue ? styles.selectedText : styles.placeholderText}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666"/>
      </TouchableOpacity>

      {showCustomInput && selectedValue === 'Other' && (
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            placeholder="Enter custom text..."
            placeholderTextColor="#aaa"
            value={customValue}
            onChangeText={onCustomChange}
          />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333"/>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[
                      styles.modalItemText,
                      item === 'Other' && styles.otherOptionText
                    ]}>
                      {item}
                    </Text>
                    {selectedValue === item && (
                      <Ionicons name="checkmark-circle" size={24} color="#2c5f59"/>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { marginTop: 20 },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#444', 
    marginBottom: 8, 
    textTransform: 'uppercase' 
  },
  dropdown: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    minHeight: 48
  },
  placeholderText: { color: '#aaa' },
  selectedText: { color: '#333', fontWeight: '500' },
  customInputContainer: {
    marginTop: 10,
  },
  customInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    minHeight: 48,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  modalItem: { 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalItemContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  modalItemText: { 
    fontSize: 16, 
    color: '#333' 
  },
  otherOptionText: {
    fontWeight: 'bold',
    color: '#2c5f59',
  },
});

export default SingleSelectDropdown;
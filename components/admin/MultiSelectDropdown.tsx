import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, FlatList, 
  StyleSheet, TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedItems: string[];
  onSelect: (items: string[]) => void;
  placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ 
  label, 
  options, 
  selectedItems, 
  onSelect, 
  placeholder 
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleItem = (item: string) => {
    if (item === 'All') {
      onSelect(['All', ...options]);
    } else {
      let newSelection = [...selectedItems];
      
      if (selectedItems.includes(item)) {
        newSelection = selectedItems.filter(i => i !== item);
        if (newSelection.includes('All')) {
          newSelection = newSelection.filter(i => i !== 'All');
        }
      } else {
        newSelection.push(item);
        if (newSelection.length === options.length && !newSelection.includes('All')) {
          newSelection = ['All', ...options];
        }
      }
      
      onSelect(newSelection);
    }
  };

  const removeItem = (item: string) => {
    let newSelection = selectedItems.filter(i => i !== item);
    if (newSelection.includes('All')) {
      newSelection = newSelection.filter(i => i !== 'All');
    }
    onSelect(newSelection);
  };

  const getDisplayText = () => {
    if (selectedItems.length === 0) return placeholder;
    if (selectedItems.includes('All')) return 'All';
    if (selectedItems.length === options.length) return 'All';
    return `${selectedItems.length} selected`;
  };

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedItems.length > 0 ? styles.selectedText : styles.placeholderText}>
          {getDisplayText()}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666"/>
      </TouchableOpacity>

      {selectedItems.length > 0 && !selectedItems.includes('All') && (
        <View style={styles.chipsContainer}>
          {selectedItems.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
              <TouchableOpacity onPress={() => removeItem(item)} style={styles.chipRemove}>
                <Ionicons name="close-circle" size={18} color="#2c5f59" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select {label}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333"/>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={['All', ...options]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => toggleItem(item)}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={[
                        styles.modalItemText,
                        item === 'All' && styles.allOptionText
                      ]}>
                        {item}
                      </Text>
                      {selectedItems.includes(item) && (
                        <Ionicons name="checkmark-circle" size={24} color="#2c5f59"/>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
              
              <TouchableOpacity 
                style={styles.modalDoneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f3f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2c5f59',
  },
  chipText: {
    color: '#2c5f59',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  chipRemove: {
    marginLeft: 2,
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
  allOptionText: {
    fontWeight: 'bold',
    color: '#2c5f59',
  },
  modalDoneButton: { 
    backgroundColor: '#2c5f59', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 20
  },
  modalDoneButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default MultiSelectDropdown;
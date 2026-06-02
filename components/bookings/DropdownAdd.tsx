import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Mocking your asset imports (Matches your original pathing structure)
const DropIconAdd = require('../../assets/icons/booking/add.png');

type Props = {
  options: string[];
  placeholder: string;
  placeholderColor?: string;
  showRequired?: boolean;
  onSelectOption?: (options: string[]) => void;
  dropdownType?: string;
  borderColor?: string;
  value?: string[];
  onOpen?: () => void;
  onClose?: () => void; // Added onClose support
};

const DropdownAdd = ({
  options,
  placeholder,
  placeholderColor = '#4B4B4B',
  showRequired = false,
  onSelectOption,
  dropdownType,
  borderColor = '#E0E0E0', // Softer default gray border
  value,
  onOpen,
  onClose
}: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isFocus, setIsFocus] = useState(false); // Track focus state for modern UX enhancements

  // Synchronize incoming programmatic values
  useEffect(() => {
    setSelectedOptions(value || []);
  }, [value]);

  // Map plain array strings to the format the library expects
  const data = options.map((item, index) => ({ label: item, value: item, index }));

  const getDropIcon = () => {
    if (dropdownType === 'shift') {
      return require('../../assets/icons/booking/clock.png');
    }
    return DropIconAdd;
  };

  // Custom renderer for the right-side icon
  const renderRightIcon = () => (
    <Image
      source={getDropIcon()}
      style={[
        { width: hp('2.2%'), height: hp('2.2%') },
        // Rotates the icon 180 degrees smoothly when open if it's a dynamic icon type
        isFocus && dropdownType !== 'shift' && { transform: [{ rotate: '180deg' }], tintColor: '#2F6BFF' }
      ]}
    />
  );

  // Custom renderer for alternating row items
  const renderItem = (item: { label: string; value: string; index: number }) => {
    const backgroundColor = item.index % 2 === 0 ? '#fff' : '#f9f9f9';
    const isSelected = selectedOptions.includes(item.value);

    return (
      <View style={[
        styles.itemContainer,
        { backgroundColor },
        isSelected && styles.selectedOption
      ]}>
        <Text style={[styles.itemText, isSelected && styles.selectedOptionText]}>
          {item.label}
        </Text>
      </View>
    );
  };

  // Custom renderer for selected tags/chips inside the box
  const renderSelectedItem = (item: { label: string; value: string; index: number }, unSelect?: (item: any) => void) => {
    return (
      <View style={styles.tag}>
        <Text style={styles.tagText}>{item.label}</Text>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => unSelect && unSelect(item)}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showRequired && selectedOptions.length === 0 && (
        <Text style={styles.requiredAbsolute}>*</Text>
      )}

      <MultiSelect
        style={[
          styles.dropdownStyle,
          { borderColor: isFocus ? 'hsl(142, 71%, 45%)' : borderColor }, // Primary glow border on focus
          isFocus && styles.dropdownActiveBackground // Soft tint background when active
        ]}
        placeholderStyle={[styles.placeholder, { color: placeholderColor }]}
        containerStyle={styles.menuContainer}
        activeColor="transparent" // Disables default library highlight layer in favor of custom styles
        visibleSelectedItem={true}
        inside={true}
        data={data}
        maxHeight={hp('26.8%')}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={selectedOptions}
        onFocus={() => {
          setIsFocus(true);
          onOpen?.();
        }}
        onBlur={() => {
          setIsFocus(false);
          onClose?.();
        }}
        onChange={items => {
          setSelectedOptions(items);
          onSelectOption?.(items);
        }}
        renderRightIcon={renderRightIcon}
        renderItem={renderItem}
        renderSelectedItem={renderSelectedItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2.5%'),
    position: 'relative',
  },
  dropdownStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, // Matching the prominent look of your single dropdown
    borderRadius: 12,
    paddingHorizontal: wp('3.5%'),
    minHeight: hp('5.5%'), // Slightly boosted initial target sizing
    backgroundColor: '#fff',
    paddingVertical: hp('0.5%'),
  },
  dropdownActiveBackground: {
    backgroundColor: '#F4F7FF', // Subtle blue hint background tint when opened
  },
  placeholder: {
    fontSize: wp('3.6%'),
    fontWeight: '400',
  },
  menuContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginTop: 4, // Leaves a breathing gap right below the main input field
    elevation: 8,
    shadowColor: 'hsl(142, 71%, 45%)', // Clean colored blueprint shadow depth
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  itemContainer: {
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('4%'),
  },
  itemText: {
    fontSize: hp('1.7%'),
    color: '#4A4A4A',
  },
  selectedOption: {
    backgroundColor: '#EBF1FF', // Matches active single-dropdown active item rows
  },
  selectedOptionText: {
    color: 'hsl(142, 71%, 25%)',
    fontWeight: '600',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 20,
    marginTop: hp('0.5%'),
    marginBottom: hp('0.5%'),
    marginRight: wp('2%'),
  },
  tagText: {
    color: '#333',
    fontSize: wp('3.2%'),
    marginRight: 6,
  },
  removeText: {
    color: '#FF3B30',
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
  requiredAbsolute: {
    color: '#FF3B30',
    position: 'absolute',
    right: wp('12%'),
    top: hp('1.5%'),
    zIndex: 10,
  },
});

export default DropdownAdd;
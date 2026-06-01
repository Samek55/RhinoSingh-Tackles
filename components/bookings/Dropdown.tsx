import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Dropdown as LibDropdown } from 'react-native-element-dropdown';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const DropIcon = require('../../assets/icons/contact/DropDown.png');

type Props = {
  options: string[];
  placeholder: string;
  placeholderColor?: string;
  showRequired?: boolean;
  onSelectOption: (option: string) => void;
  dropdownType?: string;
  borderColor?: string;
  value?: string;
  onOpen?: () => void;
  onClose?: () => void; // Added onClose prop support
};

const Dropdown = ({
  options,
  placeholder,
  placeholderColor = '#4B4B4B',
  showRequired = false,
  onSelectOption,
  dropdownType,
  borderColor = '#E0E0E0', // Changed default to a softer grey so focus states stand out
  value,
  onOpen,
  onClose
}: Props) => {
  // Track focus state to trigger dynamic UI/color upgrades
  const [isFocus, setIsFocus] = useState(false);

  const data = options.map((item, index) => ({ label: item, value: item, index }));

  const getDropIcon = () => {
    if (dropdownType === 'shift') {
      return require('../../assets/icons/booking/clock.png');
    }
    return DropIcon;
  };

  const renderRightIcon = () => (
    <Image
      source={getDropIcon()}
      style={[
        { width: hp('2.2%'), height: hp('2.2%') },
        // Rotates the icon 180 degrees smoothly when open if it's an arrow
        isFocus && dropdownType !== 'shift' && { transform: [{ rotate: '180deg' }], tintColor: '#2F6BFF' }
      ]}
    />
  );

  const renderItem = (item: { label: string; value: string; index: number }) => {
    const backgroundColor = item.index % 2 === 0 ? '#fff' : '#f9f9f9';
    const isSelected = value === item.value;

    return (
      <View style={[
        styles.itemContainer, 
        { backgroundColor },
        isSelected && styles.selectedRowBackground
      ]}>
        <Text style={[styles.itemText, isSelected && styles.selectedRowText]}>
          {item.label}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showRequired && !value && (
        <Text style={styles.requiredAbsolute}>*</Text>
      )}

      <LibDropdown
        style={[
          styles.dropdownStyle, 
          { borderColor: isFocus ? '#2F6BFF' : borderColor }, // Primary glow on focus
          isFocus && styles.dropdownActiveBackground // Soft tint when active
        ]}
        placeholderStyle={[styles.placeholder, { color: placeholderColor }]}
        selectedTextStyle={styles.selectedText}
        containerStyle={styles.menuContainer}
        activeColor="transparent" // Bypassed default gray box overlay to let custom styles shine
        data={data}
        maxHeight={hp('26.8%')}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => {
          setIsFocus(true);
          onOpen?.();
        }}
        onBlur={() => {
          setIsFocus(false);
          onClose?.();
        }}
        onChange={item => {
          onSelectOption(item.value);
          setIsFocus(false);
        }}
        renderRightIcon={renderRightIcon}
        renderItem={renderItem}
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
    borderWidth: 1.5, // Upped border width slightly to make active states snappy
    borderRadius: 12,
    paddingHorizontal: wp('3.5%'),
    height: hp('5.5%'), // Slightly taller for better touch targets and prominence
    backgroundColor: '#fff',
  },
  dropdownActiveBackground: {
    backgroundColor: '#F4F7FF', // Subtle background color change when open
  },
  placeholder: {
    fontSize: wp('3.6%'),
    fontWeight: '400',
  },
  selectedText: {
    fontSize: wp('3.6%'),
    fontWeight: '500',
    color: '#1A1A1A', // Darker text color for better readability
  },
  menuContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4, // Cleans up layout structure so popup menu doesn't crush the input box
    elevation: 8,
    shadowColor: '#2F6BFF', // Colored shadow theme accents
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  itemContainer: {
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('4%'),
  },
  itemText: {
    fontSize: hp('1.7%'),
    color: '#4A4A4A',
  },
  selectedRowBackground: {
    backgroundColor: '#EBF1FF', // Distinct selection row tracking color
  },
  selectedRowText: {
    color: '#2F6BFF', // Gives selected items a brand-focused callout color
    fontWeight: '600',
  },
  requiredAbsolute: {
    color: '#FF3B30',
    position: 'absolute',
    right: wp('12%'),
    top: hp('1.5%'),
    zIndex: 10,
  },
});

export default Dropdown;
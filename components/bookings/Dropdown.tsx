import React, { useState, useMemo, useCallback } from 'react';
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
  onClose?: () => void;
};

const Dropdown = ({
  options,
  placeholder,
  placeholderColor = '#4B4B4B',
  showRequired = false,
  onSelectOption,
  dropdownType,
  borderColor = '#E0E0E0',
  value,
  onOpen,
  onClose
}: Props) => {

  const [isFocus, setIsFocus] = useState(false);

  // Memoize data options mapped for the library layout
  const data = useMemo(() => {
    return options.map((item, index) => ({
      label: item,
      value: item,
      index,
    }));
  }, [options]);

  // Determine which asset source to load
  const getDropIcon = useCallback(() => {
    if (dropdownType === 'shift') {
      return require('../../assets/icons/booking/clock.png');
    }
    return DropIcon;
  }, [dropdownType]);

  // Memoized drop-menu list item rendering logic
  const renderItem = useCallback(
    (item: { label: string; value: string; index: number }) => {
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
    },
    [value]
  );

  // Dynamic right-hand side icon configurations with explicit state-color tracking
  const renderRightIcon = useCallback(() => {
    const activeColor = dropdownType === 'shift' ? '#10B981' : '#2F6BFF';
    const inactiveColor = '#4B4B4B'; 

    return (
      <Image
        source={getDropIcon()}
        style={[
          {
            width: hp('2.2%'),
            height: hp('2.2%'),
            tintColor: isFocus ? activeColor : inactiveColor
          },
          isFocus && {
            ...(dropdownType !== 'shift' && { transform: [{ rotate: '180deg' }] }),
          }
        ]}
      />
    );
  }, [isFocus, dropdownType, getDropIcon]);

  return (
    <View style={styles.container}>

      {showRequired && !value && (
        <Text style={styles.requiredAbsolute}>*</Text>
      )}

      <LibDropdown
      key={dropdownType}
        style={[
          styles.dropdownStyle,
          { borderColor: isFocus ? 'hsl(142, 71%, 45%)' : borderColor },
          isFocus && styles.dropdownActiveBackground
        ]}

        placeholderStyle={[styles.placeholder, { color: placeholderColor }]}
        selectedTextStyle={styles.selectedText}
        containerStyle={styles.menuContainer}

        activeColor="transparent"
        data={data}

        maxHeight={hp('26.8%')}
        labelField="label"
        valueField="value"

        search
        searchPlaceholder="Search..."
        inputSearchStyle={styles.searchInput}

        placeholder={placeholder}
        value={value}

        onFocus={() => {
          setIsFocus(true);
          if (onOpen) onOpen();
        }}

        onBlur={() => {
          setIsFocus(false);
          if (onClose) onClose();
        }}

        onChange={(item) => {
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
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: wp('3.5%'),
    height: hp('5.5%'),
    backgroundColor: '#fff',
  },
  dropdownActiveBackground: {
    backgroundColor: '#F4F7FF',
  },
  placeholder: {
    fontSize: wp('3.6%'),
    fontWeight: '500',
  },
  selectedText: {
    fontSize: wp('3.6%'),
    fontWeight: '500',
    color: '#1A1A1A',
  },
  menuContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginTop: 4,
    elevation: 8,
    shadowColor: 'hsl(142, 71%, 45%)',
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
  selectedRowBackground: {
    backgroundColor: '#EBF1FF',
  },
  selectedRowText: {
    color: 'hsl(142, 71%, 35%)',
    fontWeight: '600',
  },
  requiredAbsolute: {
    color: '#FF3B30',
    position: 'absolute',
    right: wp('12%'),
    top: hp('1.5%'),
    zIndex: 10,
  },
  searchInput: {
    borderRadius: 8,
    borderColor: '#E0E0E0',
    fontSize: wp('3.6%'),
    color: '#1A1A1A',
    height: hp('4.5%'),
  },
});

export default Dropdown;
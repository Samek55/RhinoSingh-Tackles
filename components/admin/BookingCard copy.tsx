import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DropdownIcon from '../../assets/icons/contact/DropDown.png';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type BookingItem = {
  id: string;

  fullName: string;
  email: string;
  phone: string;

  city?: string;
  area?: string;

  service: string;
  shift: string;

  budget: string;
  priority: string;

  startingDate: string;
  status: string;
};

type Props = {
  item: BookingItem;
  isOpen: boolean;
  onToggle: () => void;
  onPress: () => void;
};

const BookingCard = ({ item, isOpen, onToggle, onPress }: Props) => {

  const status = item.status?.toLowerCase();

  return (
    <View style={styles.card}>

      {/* HEADER */}
      <View style={styles.cardHeader}>

        {/* LEFT SIDE */}
        <View style={styles.leftSection}>
          <Text style={styles.name}>{item.fullName}</Text>

          <Text style={styles.subText}>{item.phone}</Text>
          <Text style={styles.subText}>{item.email}</Text>

          <Text style={styles.subText}>
            {item.city || item.area}
          </Text>

          <Text style={styles.subText}>
            {item.service} • {item.shift}
          </Text>

          <Text style={styles.budget}>
            Budget: {item.budget}
          </Text>

          <Text style={styles.priority}>
            Priority: {item.priority}
          </Text>

          <Text style={styles.status}>
            Status: {item.status}
          </Text>

          <Text
            style={[
              styles.status,
              status === 'completed' && styles.completed,
              status === 'pending' && styles.pending,
              status === 'cancelled' && styles.cancelled,
            ]}
          >
            {item.status}
          </Text>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.rightSection}>
          <Text style={styles.date}>
            {item.startingDate
              ? new Date(item.startingDate).toDateString()
              : ''}
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onToggle}
          >
            <Text style={styles.actionText}>Action</Text>
            <Image source={DropdownIcon} style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

      </View>

      {/* DROPDOWN */}
      {isOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={onPress} style={styles.dropdownItem}>
            <Text style={styles.dropdownText}>View</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.separator} />
    </View>
  );
};

export default BookingCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: hp('3%'),
  },

  cardHeader: {
    flexDirection: 'row',
  },

  leftSection: {
    flex: 2,
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: hp('2%'),
    fontWeight: '700',
    marginBottom: 4,
  },

  subText: {
    fontSize: hp('1.4%'),
    color: '#555',
  },

  budget: {
    marginTop: 4,
    fontWeight: '600',
  },

  priority: {
    fontWeight: '600',
    color: '#333',
  },

  status: {
    marginTop: 6,
    fontWeight: '700',
  },

  completed: { color: 'green' },
  pending: { color: '#E8A317' },
  cancelled: { color: 'red' },

  date: {
    fontSize: hp('1.4%'),
    fontStyle: 'italic',
    color: '#444',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },

  actionText: {
    color: '#fff',
    fontWeight: '600',
  },

  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },

  dropdown: {
    position: 'absolute',
    right: 10,
    top: hp('6%'),
    backgroundColor: '#fff',
    borderRadius: 10,
    width: wp('35%'),
    elevation: 6,
    zIndex: 999,
  },

  dropdownItem: {
    padding: hp('1.5%'),
    alignItems: 'center',
  },

  dropdownText: {
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  separator: {
    borderBottomWidth: 1,
    borderColor: 'green',
    marginVertical: hp('1.5%'),
  },
});
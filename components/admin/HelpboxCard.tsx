import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ResearchIcon from '../../assets/icons/admin/research.png';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export type BookingItem = {
  helpbox_uin: string; 
  phone: string;
  bookingDate: string;
  status: string;
};

type Props = {
  item: BookingItem;
  isOpen: boolean;
  onToggle: () => void;
  onPress: () => void;
};

const getStatusType = (status: string) => {
  const s = status?.toLowerCase() || '';

  if (s.includes('completed')) return 'Completed';
  if (s.includes('pending')) return 'Pending';
  if (s.includes('cancel')) return 'Cancelled';

  return 'Other';
};

const HelpboxCard = ({ item, isOpen, onToggle, onPress }: Props) => {
  const statusType = getStatusType(item.status);
  
  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>

        {/* LEFT SIDE */}
        <View style={styles.leftSection}>
          <Text style={styles.name}>{item.phone}</Text>
          <Text style={styles.uin}>UIN : {item.helpbox_uin}</Text>
          
          {/* STATUS PILL BADGE */}
          <View style={styles.infoContainer}>
            <View
              style={[
                styles.statusBadge,
                statusType === 'Completed' && styles.completedBadge,
                statusType === 'Pending' && styles.pendingBadge,
                statusType === 'Cancelled' && styles.cancelledBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  statusType === 'Completed' && styles.completedText,
                  statusType === 'Pending' && styles.pendingText,
                  statusType === 'Cancelled' && styles.cancelledText,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.rightSection}>
          <Text style={styles.dateTop}>
            {item.bookingDate ? new Date(item.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>View</Text>
            <Image
              source={ResearchIcon}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

export default React.memo(HelpboxCard);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F4F7',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4.5%'),
    marginBottom: hp('1.5%'),
    
    // Smooth Modern Shadow styling
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftSection: {
    flex: 1.5,
    justifyContent: 'center',
    gap: hp('0.6%'),
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: hp('1.2%'),
  },
  name: {
    fontSize: hp('1.95%'),
    fontWeight: '700',
    color: '#1D2939',
    letterSpacing: -0.2,
  },
  uin: {
    fontSize: hp('1.5%'),
    fontWeight: '700',
    color: '#145319',
    letterSpacing: -0.2,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Status Pill Badges Layout
  statusBadge: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: 12,
    backgroundColor: '#F2F4F7', // Default structural backup
  },
  statusText: {
    fontWeight: '600',
    fontSize: hp('1.45%'),
    color: '#475467',
  },
  
  // Completed Colors
  completedBadge: { backgroundColor: '#ECFDF3' },
  completedText: { color: '#027A48' },
  
  // Pending Colors
  pendingBadge: { backgroundColor: '#FFFAEB' },
  pendingText: { color: '#B54708' },
  
  // Cancelled Colors
  cancelledBadge: { backgroundColor: '#FEF3F2' },
  cancelledText: { color: '#B42318' },

  dateTop: {
    fontSize: hp('1.4%'),
    color: '#667085',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('4.5%'),
    paddingVertical: hp('0.9%'),
    borderRadius: 10,
    gap: 6,
    backgroundColor: '#107C41', // Emerald shade of green
  },
  dropdownIcon: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: hp('1.6%'),
  },
});
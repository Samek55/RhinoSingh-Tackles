import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ResearchIcon from '../../assets/icons/admin/research.png';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export type WorkforceItem = {
  id: string | number;
  fullName: string;            // Fixed to match API map conversion
  email: string;
  phone: string;
  position_applied_for?: string[];
  preferred_working_area?: string | null;
  area_of_expertise?: string[];
  years_of_experience?: string | number | null;
  insurance_policy_number?: string | null;
  emergency_contact_number?: string | null;
  cover_letter?: string | null;
  message?: string | null;
  id_proof?: string | null;
  resume_cv?: string | null;
  ApplicationDate: string;     // Fixed to match API map conversion
  status: string;
};

type Props = {
  item: WorkforceItem;
  isOpen: boolean;
  onToggle: () => void;
  onPress: () => void;
};

const getStatusType = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('accepted')) return 'Accepted';
  if (s.includes('pending')) return 'Pending';
  if (s.includes('rejected')) return 'Rejected';
  return 'Other';
};

const ProfessionalCard = ({ item, isOpen, onToggle, onPress }: Props) => {
  const statusType = getStatusType(item.status);

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        {/* LEFT SIDE */}
        <View style={styles.leftSection}>
          {/* FIXED: References item.fullName matching the mapping utility */}
          <Text style={styles.name}>{item.fullName || 'N/A'}</Text>
          <Text style={styles.service}>{item.email || 'N/A'}</Text>
          <Text style={styles.budget}>{item.phone || 'N/A'}</Text>
          {/* INFO */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.status,
                statusType === 'Accepted' && styles.completed,
                statusType === 'Pending' && styles.pending,
                statusType === 'Rejected' && styles.cancelled,
              ]}
            >
              {item.status || 'Pending'}
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.rightSection}>
          <Text style={styles.dateTop}>
            {/* FIXED: References item.ApplicationDate matching the mapping utility */}
            {item.ApplicationDate
              ? new Date(item.ApplicationDate).toDateString()
              : ''}
          </Text>

          <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Text style={styles.actionText}>View</Text>
            <Image source={ResearchIcon} style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ borderBottomWidth: 1, borderColor: 'green', marginVertical: hp('1.5%') }} />
    </View>
  );
};

export default React.memo(ProfessionalCard);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    paddingHorizontal: hp('4%'),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  leftSection: {
    flex: 2,
    justifyContent: 'space-between',
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'space-between',
  },
  dateTop: {
    fontSize: hp('1.4%'),
    color: '#444',
    paddingTop: hp('1%'),
    fontStyle: 'italic',
  },
  name: {
    fontSize: hp('2%'),
    fontWeight: '700',
  },
  service: {
    marginTop: hp('0.3%'),
    fontSize: hp('1.5%'),
    color: '#555',
  },
  budget: {
    fontSize: hp('1.6%'),
    color: '#555',
    marginTop: hp('0.5%'),
  },
  infoContainer: {
    marginTop: 3,
  },
  status: {
    fontWeight: '700',
    fontSize: hp('1.6%'),
  },
  completed: { color: 'green' },
  pending: { color: '#E8A317' },
  cancelled: { color: 'red' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: hp('0.5%'),
    backgroundColor: 'green',
  },
  dropdownIcon: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
});
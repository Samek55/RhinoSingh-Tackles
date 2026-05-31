import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FaqsScreen from '../../src/Screens/FaqsScreen';

export default function FAQsPage() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <FaqsScreen />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: hp('3.8%'),
    right: wp('14%'),
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('5%'),
    borderWidth: 1,
    backgroundColor: '#058610',
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 10,
  },
  menuIcon: {
    fontSize: hp('2.3%'),
    color: '#fff',
    fontWeight: '700',
  },
});

import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import HeaderComponent from '../../components/HeaderComponent';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Font scaling utility function
const scaleFont = (size: number) => {
  const guidelineBaseWidth = 375; // Base screen width to scale from
  return (size * width) / guidelineBaseWidth;
};

const AdminOtpVerify = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/Home' as any);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.mainContainer}>
      <HeaderComponent style={styles.header} />
      <View style={{ borderBottomWidth: 1, borderColor: '#CAD2DF', marginTop: 16 }} />


      <View style={styles.container}>
        <Text style={styles.thankYouText}>
          Thank you! OTP verified successfully. Your booking is now confirmed!
        </Text>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/icons/admin/check-mark.png')}
            style={styles.image}
          />
          <Text style={styles.confirmationText}>
            OTP confirmed — booking successful!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: '4%',
    paddingVertical: '5%',
    flex: 1,
  },
  thankYouText: {
    fontSize: scaleFont(20),
    fontWeight: '400',
    borderWidth:0,
    marginTop:hp('3%'),
    textAlign:'center'
  },
  imageContainer: {
    flex: 1,

    alignItems: 'center',
    marginTop: height * 0.1,
  },
  image: {
    width: width * 0.48, // Scale image width based on screen size
    height: height * 0.26, // Scale image height based on screen size
    resizeMode: 'contain', // Ensure the image scales proportionally
  },
  confirmationText: {
    marginTop: height * 0.04, // Adjust top margin based on screen height
    fontSize: scaleFont(20),
    width: '70%',
    textAlign: 'center',
    fontWeight: '600',
    color:'green'
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    marginTop: hp('2.0%'),
    paddingHorizontal: 15.7,
  },
});

export default AdminOtpVerify;

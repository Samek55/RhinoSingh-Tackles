import { View, Text, Image, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type Props = {
  title: string;
  suBTitle: string;
  image: any;
  style?: ImageStyle; // Specific type for image overrides
};

const OurTeamCard = ({ title, suBTitle, image, style }: Props) => {
  return (
    <View style={styles.container}>
      {/* Container wrapper for the image shadow to prevent overflow/clipping bugs */}
      <View style={styles.imageContainer}>
        <Image source={image} style={[styles.image, style]} />
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.suBTitle} numberOfLines={2}>{suBTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: hp('1%'),
    // 3 cards at 28% width = 84%. Leaving 16% total room for gaps/margins.
    width: wp('28%'), 
  },
  imageContainer: {
    borderRadius: wp('9%'), // Match half of width/height for a perfect circle
    backgroundColor: '#fff',
    // Platform-safe native shadow properties
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  image: {
    width: wp('18%'), 
    height: wp('18%'), 
    resizeMode: 'cover', // 'cover' looks much better for real portrait/avatar photos than 'contain'
    borderRadius: wp('9%'),
  },
  title: {
    marginTop: hp('1%'),
    fontWeight: '600',
    fontSize: wp('3.5%'), 
    color: '#111827', // Clean off-black
    textAlign: 'center',
    width: '100%',
  },
  suBTitle: {
    marginTop: hp('0.3%'),
    fontWeight: '400',
    fontSize: wp('2.8%'), 
    color: '#6B7280', // Soft gray for subtext
    textAlign: 'center',
    width: '100%',
  },
});

export default OurTeamCard;
import {
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type Props = {
  name: string;
  words: string;
  image: any;
  onPress?: any;
  style?: any;
  textStyle?: any;
  navigation?: any;
  description?: string;
  question?: string;
  answer?: string;
  id?: number;
};

const ServicesDisplaycard = ({
  name,
  words,
  image,
  onPress,
  style,
  textStyle,
}: Props) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.cardContainer, style]}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.textContainer}>
        {/* Enforced single line restrictions with clean tail truncation */}
        <Text style={[styles.title, textStyle]} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
        <Text style={[styles.words, textStyle]} numberOfLines={1} ellipsizeMode="tail">{words}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: '100%', 
    paddingBottom: hp(1.5), 
    
    shadowColor: '#295C59',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  image: {
    width: '100%',
    height: hp(13), 
  },

  textContainer: {
    width: '100%',
  },

  title: {
    fontSize: wp(3.6),
    fontWeight: '600',
    marginTop: hp(1),
    color: '#000',
    paddingHorizontal: 10,
  },

  words: {
    fontSize: wp(3),
    fontWeight: '500',
    color: 'grey',
    paddingHorizontal: 10,
    marginTop: hp(0.4),
    flexShrink: 1, 
  },
});

export default ServicesDisplaycard;
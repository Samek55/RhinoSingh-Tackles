import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type Props = {
  name: string;
  description: string;
  image: any;
  onPress?: any;
  answer?: string;
  question?: string;
  id?: any;
  navigation?: any;
};

const truncateDescription = (description: string) => {
  const words = description.split(' ');
  if (words.length > 8) {
    return words.slice(0, 8).join(' ') + '...';
  }
  return description; 
};

const ServicesCards = ({
  name,
  description,
  image,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="cover" 
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description}>
          {truncateDescription(description)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    width: wp(90),
    height: wp(26),
    marginBottom: hp(3.5),
    alignItems: 'center',
    borderRadius: 12,
    boxShadow: '0px 0px 1px #7cbc7a',
    // REMOVED: hardcoded gap: 20 to protect 50-50 space constraints
  },
  imageContainer: {
    flex: 1, 
  },
  image: {
    width: '100%', 
    height: wp(25.8), 
    borderRadius: 8, 
    marginTop: -20,
    marginLeft: 3,
    boxShadow: '-10px 10px 2px rgba(0, 0, 0,0.15)',
  },
  textContainer: {
    flex: 1, 
    
    // FIX: Using responsive padding left creates the perfect gap 
    // while keeping the 50-50 split completely math-safe on small devices
    paddingLeft: wp(4), 
    paddingRight: wp(1), 
  },
  title: {
    fontSize: wp(4.1), 
    fontWeight: '600',
    color: '#000',
    paddingBottom: 3,
  },
  description: {
    fontSize: wp(3.7), 
    fontWeight: '400',
    color: 'hsl(0, 0%, 25%)',
    letterSpacing: -0.3,
    lineHeight: 17,
  },
});

export default ServicesCards;
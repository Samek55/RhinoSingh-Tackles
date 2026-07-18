import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Image, Dimensions, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface RoadBlockCardProps {
  data: {
    title: string;
    imageUrl: string;
    message: string;
    buttonLabel: string;
    countdownSeconds?: number | null;
  };
  runCountdown?: boolean;
  onClose?: () => void;
  onButtonPress?: () => void;
}

const RoadBlockCard: React.FC<RoadBlockCardProps> = ({ 
  data, 
  runCountdown = true,
  onClose,
  onButtonPress 
}) => {
  const [countdown, setCountdown] = useState<number>(data.countdownSeconds || 0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (runCountdown && data.countdownSeconds && data.countdownSeconds > 0) {
      setCountdown(data.countdownSeconds);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [runCountdown, data.countdownSeconds]);

  const handleClose = () => {
    if (countdown === 0 || !runCountdown) {
      setIsVisible(false);
      onClose?.();
    }
  };

  const handleButtonPress = () => {
    onButtonPress?.();
  };

  if (!isVisible) return null;

  const showCountdown = runCountdown && countdown > 0;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.cardContainer}>
          {/* Banner Image - Full width at top */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: data.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              defaultSource={require('@/assets/09B740A6-443F-4BAE-A3CA-2C4534B1CB1A.png')}
            />
          </View>

          {/* Close Button - positioned on top of image */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={showCountdown ? 0.5 : 0.7}
            disabled={showCountdown}
          >
            <View style={styles.closeButtonContent}>
              {showCountdown ? (
                <Text style={styles.countdownText}>{countdown}</Text>
              ) : (
                <Ionicons 
                  name="close" 
                  size={wp('5%')} 
                  color="#fff" 
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Content below image */}
          <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={styles.title}>{data.title}</Text>

            {/* Message */}
            <Text style={styles.message}>{data.message}</Text>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleButtonPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{data.buttonLabel || 'View More'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: wp('5%'),
    width: width * 0.9,
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: wp('3%'),
    right: wp('3%'),
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 100,
    width: wp('9%'),
    height: wp('9%'),
    minWidth: 32,
    minHeight: 32,
    maxWidth: 44,
    maxHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  countdownText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  contentContainer: {
    padding: wp('4%'),
    paddingTop: wp('3%'),
    alignItems: 'center',
  },
  title: {
    fontSize: wp('5.5%'),
    fontWeight: '800',
    color: '#1C2B2A',
    textAlign: 'left',
    marginBottom: hp('1%'),
    lineHeight: wp('7%'),
    paddingHorizontal: wp('2%'),
    marginRight:wp('30%')

  },
  message: {
    fontSize: wp('3.8%'),
    color: '#4A5B5A',
    textAlign: 'left',
    marginBottom: hp('2%'),
    lineHeight: wp('5.5%'),
    paddingHorizontal: wp('2%'),
  },
  actionButton: {
    backgroundColor: '#295C59',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('10%'),
    borderRadius: wp('8%'),
    width: '100%',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4.2%'),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default RoadBlockCard;
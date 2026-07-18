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

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.cardContainer}>
          {/* Close Button with Countdown */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={countdown > 0 && runCountdown ? 0.5 : 0.7}
            disabled={countdown > 0 && runCountdown}
          >
            <View style={styles.closeButtonContent}>
              <Ionicons 
                name="close" 
                size={20} 
                color={countdown > 0 && runCountdown ? '#999' : '#fff'} 
              />
              {runCountdown && countdown > 0 && (
                <Text style={styles.countdownText}>{countdown}</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Banner Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: data.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              defaultSource={require('@/assets/09B740A6-443F-4BAE-A3CA-2C4534B1CB1A.png')}
            />
          </View>

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
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    padding: wp('4%'),
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    zIndex: 10,
    backgroundColor: '#295C59',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  countdownText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 18,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: hp('2%'),
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C2B2A',
    textAlign: 'center',
    marginBottom: hp('1%'),
    lineHeight: 26,
  },
  message: {
    fontSize: 14,
    color: '#4A5B5A',
    textAlign: 'center',
    marginBottom: hp('2%'),
    lineHeight: 20,
    paddingHorizontal: wp('2%'),
  },
  actionButton: {
    backgroundColor: '#295C59',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('10%'),
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: hp('0.5%'),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default RoadBlockCard;
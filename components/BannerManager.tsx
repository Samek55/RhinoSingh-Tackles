import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import RoadBlockCard from '@/components/RoadBlockCard';
import { useBanner } from '@/hooks/useBanner';

interface BannerManagerProps {
  children: React.ReactNode;
}

const BannerManager: React.FC<BannerManagerProps> = ({ children }) => {
  const { banner, loading, showBanner, closeBanner } = useBanner();

  const handleButtonPress = async () => {
    if (banner?.button_link) {
      console.log('Navigate to:', banner.button_link);
    }
    closeBanner();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#295C59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {children}
      
      {showBanner && banner && (
        <RoadBlockCard
          data={{
            title: banner.name || 'Special Offer',
            imageUrl: banner.image_url || 'https://via.placeholder.com/400',
            message: banner.message || '',
            buttonLabel: banner.button_text || 'View More',
            countdownSeconds: banner.countdown_timer || 10,
          }}
          runCountdown={true}
          onClose={closeBanner}
          onButtonPress={handleButtonPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fcfb',
  },
});

export default BannerManager;
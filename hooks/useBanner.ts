import { useState, useEffect } from 'react';
import { bannerService, Banner } from '@/src/services/bannerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBanner = async () => {
      try {
        const userCity = await AsyncStorage.getItem('userCity');
        const userType = await AsyncStorage.getItem('userType');
        const userProfession = await AsyncStorage.getItem('userProfession');

        let fetchedBanners: Banner[] = [];

        if (userCity) {
          fetchedBanners = await bannerService.getBannersForUser(
            userCity,
            userType || undefined,
            userProfession || undefined
          );
        } else {
          fetchedBanners = await bannerService.getActiveBanners();
        }

        if (!isMounted) return;

        if (fetchedBanners.length > 0) {
          setBanner(fetchedBanners[0]);
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  const closeBanner = () => {
    setShowBanner(false);
  };

  return { banner, loading, showBanner, closeBanner };
};
import { router } from 'expo-router';
import ServiceBookingScreen from '../../src/Screens/ServiceBookingScreen';

const nav = {
  navigate: (screen: string, params?: any) => {
    if (screen === 'AdminOtp') {
      router.push({ pathname: '/booking/BookingOtp' as any, params });
    }
  },
  goBack: () => router.back(),
};

export default function BookingDetailPage() {
  return <ServiceBookingScreen navigation={nav} />;
}

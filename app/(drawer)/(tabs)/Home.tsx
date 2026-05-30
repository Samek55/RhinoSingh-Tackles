import { router } from 'expo-router';
import HomeScreen from '../../../src/Screens/HomeScreen';

const nav = {
  navigate: (screen: string, params?: any) => {
    if (screen === 'SingleScreen') {
      router.push({
        pathname: '/service/ServiceDetail' as any,
        params: { serviceData: JSON.stringify(params?.service) },
      });
    }
    if (screen === 'OTP') {
      router.push({
        pathname: '/otp/OtpScreen' as any,
        params: { phone: params?.phone ?? '' },
      });
    }
  },
  goBack: () => router.back(),
};

export default function HomeTab() {
  return <HomeScreen navigation={nav} />;
}

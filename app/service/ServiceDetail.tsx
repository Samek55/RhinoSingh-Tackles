import { useLocalSearchParams, router } from 'expo-router';
import SingleScreen from '../../src/Screens/SingleScreen';

export default function ServiceDetailPage() {
  const { serviceData } = useLocalSearchParams<{ serviceData: string }>();
  const service = serviceData ? JSON.parse(serviceData) : {};

  const nav = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'SingleScreen') {
        router.push({ pathname: '/service/ServiceDetail' as any, params: { serviceData: JSON.stringify(params?.service) } });
      }
      if (screen === 'Main' || screen === 'BookingTab' || screen === 'Booking') {
        router.push('/Book' as any);
      }
    },
    goBack: () => router.back(),
  };

  const route = { params: { service } };

  return <SingleScreen navigation={nav} route={route} />;
}

import { router } from 'expo-router';
import ServicesScreen from '../../../src/Screens/ServicesScreen';

const nav = {
  navigate: (screen: string, params?: any) => {
    if (screen === 'SingleScreen') {
      router.push({ pathname: '/service/ServiceDetail' as any, params: { serviceData: JSON.stringify(params?.service) } });
    }
  },
  goBack: () => router.back(),
};

export default function ServiceTab() {
  return <ServicesScreen navigation={nav} />;
}

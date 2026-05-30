import { useLocalSearchParams } from 'expo-router';
import AdminOtp from '../../src/Screens/auth/AdminOtp';

export default function BookingOtpPage() {
  const params = useLocalSearchParams();
  const route = { params };
  return <AdminOtp route={route} />;
}

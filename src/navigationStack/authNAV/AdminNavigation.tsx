import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminLogin from '../../Screens/auth/AdminLogin';
import AdminChangePassword from '../../Screens/auth/AdminChangePassword';
import BookingHistory from '../../Screens/auth/BookingHistory';
import BookingDetails_1 from '../../Screens/auth/BookingDetails_1';
import BookingDetails_2 from '../../Screens/auth/BookingDetails_2';
import BookingConfirmation from '../../Screens/auth/BookingConfirmation';
import GeneratePaymentDetails from '../../Screens/auth/GeneratePaymentDetails';
import PaymentDetails from '../../Screens/auth/PaymentDetails';

type Props = {};

const Stack = createNativeStackNavigator();

const AdminNavigation = (_props: Props) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
            <Stack.Screen name="AdminLoginScreen" component={AdminLogin} />
            <Stack.Screen name="AdminChangePasswordScreen" component={AdminChangePassword} />
            <Stack.Screen name="BookingHistoryScreen" component={BookingHistory} />
            <Stack.Screen name="BookingDetailsScreen_1" component={BookingDetails_1} />
            <Stack.Screen name="BookingDetailsScreen_2" component={BookingDetails_2} />
            <Stack.Screen name="BookingConfirmationScreen" component={BookingConfirmation} />
            <Stack.Screen name="GeneratePaymentDetailsScreen" component={GeneratePaymentDetails } />
            <Stack.Screen name="PaymentDetailsScreen" component={PaymentDetails} />


        </Stack.Navigator>
    );
};

export default AdminNavigation;

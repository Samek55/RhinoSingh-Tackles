import axios from 'axios';
import { getAuth } from 'firebase/auth';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY;

const sendNotification = async (payload: object) => {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.log('Notification skipped: missing OneSignal config');
    return;
  }
  await axios.post(
    'https://api.onesignal.com/notifications',
    { app_id: ONESIGNAL_APP_ID, ...payload },
    {
      headers: {
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export async function notifyAdminHelpbox(notiPhone: string) {
  try {
    const CleanPhone = notiPhone.trim();

    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'admin' },
        { operator: 'OR' },
        { field: 'tag', key: 'role', relation: '=', value: 'superadmin' },

      ],
      headings: { en: '🚀 New Enquiry Available!' },
      contents: { en: `New phone no : "${CleanPhone}" has sent you an enquiry. Open RocketSingh to respond.` },
    });
    
    console.log(`Helpbox notification successfully targeted for "${CleanPhone}"`);
  } catch (error: any) {
    console.error('Helpbox notification error:', error?.response?.data || error.message);
  }
}

// Service booking for notifying careers → service providers who serve that specific area and service
export async function notifyProfessionals(service: string, bookingArea: string) {
  try {
    const cleanService = service.trim();
    const cleanArea = bookingArea.trim();

    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'career' },
      ],
      headings: { en: '🚀 New Job Available!' },
      contents: { en: `New "${cleanService}" booking in ${cleanArea}. Open RocketSingh to respond.` },
    });
    
    console.log(`Booking notification successfully targeted for "${cleanService}" in ${cleanArea}`);
  } catch (error: any) {
    console.error('Booking notification error:', error?.response?.data || error.message);
  }
}

// Service booking for notifying careers → service providers who serve that specific area and service
// export async function notifyProfessionals(
//   service: string,
//   bookingArea: string
// ) {
//   try {
//     const cleanService = service.trim();
//     const cleanArea = bookingArea.trim();

//     const response = await fetch(
//       `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/notify-careers`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           role: "career",
//           service: cleanService,
//           area: cleanArea,
//         }),
//       }
//     );
//     // 1. Get the raw text first to see the error
//     const rawText = await response.text();
//     console.log("RAW SERVER RESPONSE:", rawText);

//     // 2. Try parsing it safely
//     const data = JSON.parse(rawText);
//     console.log("Parsed Data:", data);

//     console.log("Backend response:", data);
//     console.log(
//       `Notification sent for "${cleanService}" in ${cleanArea}`
//     );
//   } catch (error: any) {
//     console.error(
//       "Booking notification error:",
//       error?.message || error
//     );
//   }
// }

/**
 * Notifies the customer that their booking has been accepted.
 * @param service Name of the service
 * @param bookingArea Area of the booking
 * @param customerPhone The direct 10-digit phone number string (e.g., "9803179846")
 */
export async function notifyUsers(service: string, bookingArea: string, customerPhone: string) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const providerPhone = currentUser?.email?.slice(0, 10) || 'A service provider';
    const cleanCustomerPhone = customerPhone?.trim();

    if (!cleanCustomerPhone) {
      console.log('Notification skipped: No customer phone target provided.');
      return;
    }

    const cleanService = service?.trim() || '';
    const cleanArea = bookingArea?.trim() || '';

    await sendNotification({
      // Explicitly targeting the App Push channel along with your custom tags
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'user' },
        { operator: 'AND' },
        { field: 'tag', key: 'phone', relation: '=', value: cleanCustomerPhone }
      ],
      // This forces OneSignal to only count users with valid, subscribed Push tokens
      is_wp_wns: false,
      headings: { en: 'Booking Accepted 🚀' },
      contents: { en: `Provider (${providerPhone}) has accepted your request for "${cleanService}" in ${cleanArea}.` },
    });

    console.log(`Notification safely sent to customer tag phone: ${cleanCustomerPhone}`);
  } catch (error: any) {
    console.log('Booking notification error:', error?.response?.data || error.message);
  }
}

// Partnership form submitted → admin only
export async function notifyAdmins(applicantName: string) {
  try {
    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'admin' },
      ],
      headings: { en: 'New Partnership Application' },
      contents: { en: `${applicantName} submitted a partnership application. Review it now.` },
    });
    console.log('Admin notification sent for partnership:', applicantName);
  } catch (error: any) {
    console.log('Admin notification error:', error?.response?.data || error.message);
  }
}

// Announcements & public messages → everyone
export async function notifyAll(title: string, message: string) {
  try {
    await sendNotification({
      included_segments: ['All'],
      headings: { en: title },
      contents: { en: message },
    });
    console.log('Broadcast notification sent:', title);
  } catch (error: any) {
    console.log('Broadcast notification error:', error?.response?.data || error.message);
  }
}
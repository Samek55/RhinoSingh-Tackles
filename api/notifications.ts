import axios from 'axios';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY;

export async function notifyProfessionals(service: string, bookingArea: string) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.log('Notification skipped: missing OneSignal config');
    return;
  }

  try {
    await axios.post(
      'https://api.onesignal.com/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: 'New Booking Request' },
        contents: { en: `New booking: "${service}" in ${bookingArea}. Open RocketSingh to respond.` },
      },
      {
        headers: {
          Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Push notification sent for "${service}" in ${bookingArea}`);
  } catch (error: any) {
    console.log('Notification error:', error?.response?.data || error.message);
  }
}

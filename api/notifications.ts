import axios from 'axios';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY;

export function toTagKey(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function notifyProfessionals(service: string, bookingArea: string) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.log('Notification skipped: missing OneSignal config');
    return;
  }

  try {
    await axios.post(
      `https://api.onesignal.com/apps/${ONESIGNAL_APP_ID}/in_app_messages`,
      {
        name: `booking_${Date.now()}`,
        filters: [
          { field: 'tag', key: `service_${toTagKey(service)}`, relation: '=', value: '1' },
          { operator: 'AND' },
          { field: 'tag', key: `area_${toTagKey(bookingArea)}`, relation: '=', value: '1' },
        ],
        content: {
          en: `New booking: "${service}" in ${bookingArea}. Open RocketSingh to respond.`,
        },
        triggers: [[]],
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`In-app notification sent for "${service}" in ${bookingArea}`);
  } catch (error: any) {
    console.log('Notification error:', error?.response?.data || error.message);
  }
}

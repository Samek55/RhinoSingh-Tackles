import axios from 'axios';

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

// Service booking → service providers who serve that area
export async function notifyProfessionals(service: string, bookingArea: string) {
  try {
    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'admin' },
        { operator: 'AND' },
        { field: 'tag', key: 'area', relation: '=', value: bookingArea },
      ],
      headings: { en: 'New Service Booking' },
      contents: { en: `New "${service}" booking in ${bookingArea}. Open RocketSingh to respond.` },
    });
    console.log(`Booking notification sent for "${service}" in ${bookingArea}`);
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

// Career form submitted → admin only
export async function notifyCareerAdmins(applicantName: string) {
  try {
    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'admin' },
      ],
      headings: { en: 'New Career Application' },
      contents: { en: `${applicantName} submitted a career application. Review it now.` },
    });
    console.log('Admin notification sent for career application:', applicantName);
  } catch (error: any) {
    console.log('Career notification error:', error?.response?.data || error.message);
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

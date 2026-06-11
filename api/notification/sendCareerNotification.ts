export async function sendCareerNotification(service: string, bookingArea: string) {
  // Pulling the keys directly from your environment configuration
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  const restApiKey = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY;

  if (!appId || !restApiKey) {
    console.error("Missing OneSignal environment variables.");
    return;
  }

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${restApiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      // Target users matching the data tag: role = career
      filters: [
        {
          field: "tag",
          key: "role",
          relation: "=",
          value: "career",
        },
      ],
       headings: { en: 'New Service Booking' },
      contents: { en: `New "${service}" booking in ${bookingArea}. Open RocketSingh to respond.` },
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log("Push successfully dispatched:", result);
  } else {
    console.error("OneSignal API Error response:", result);
  }
};
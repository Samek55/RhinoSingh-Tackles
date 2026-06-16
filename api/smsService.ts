// services/smsService.ts

// Define interfaces for the request body
interface SmsDestination {
    to: string;
}

interface SmsContent {
    text: string;
}

interface SmsMessage {
    destinations: SmsDestination[];
    sender?: string;
    content: SmsContent;
}

interface SendSmsPayload {
    messages: SmsMessage[];
}

/**
 * Sends an SMS using the Infobip API
 * @param to The recipient's phone number (with country code)
 * @param messageText The body of the text message
 */
export const sendSms = async (to: string, messageText: string): Promise<any> => {
    const apiKey = process.env.EXPO_PUBLIC_INFOBIP_API_KEY;
    const baseUrl = process.env.EXPO_PUBLIC_INFOBIP_BASE_URL;
  
    if (!apiKey || !baseUrl) {
        throw new Error("Missing Infobip environment variables.");
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", apiKey);
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    const payload: SendSmsPayload = {
        messages: [
            {
                destinations: [{ to }],
                sender: "447491163443", // You can also pass this as a parameter if needed
                content: {
                    text: messageText,
                },
            },
        ],
    };

    const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow",
    };

    try {
        const response = await fetch(`${baseUrl}/sms/3/messages`, requestOptions);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        // Infobip usually returns JSON. If it returns text, use response.text()
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Failed to send SMS:", error);
        throw error;
    }
};
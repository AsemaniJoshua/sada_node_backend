import axios from 'axios';

/**
 * Send SMS via Arkesel v2 API
 * @param {string|string[]} recipients - Single phone number or array of phone numbers
 * @param {string} message - The message content
 */
export const sendArkeselSMS = async (recipients, message) => {
    try {
        const apiKey = process.env.ARKESEL_API_KEY;
        const senderId = process.env.ARKESEL_SENDER_ID || 'SADA';

        if (!apiKey) {
            console.error('[Arkesel] API Key is missing in .env');
            return { success: false, error: 'SMS service not configured' };
        }

        // Ensure recipients is an array
        const to = Array.isArray(recipients) ? recipients : [recipients];

        const response = await axios.post('https://sms.arkesel.com/api/v2/sms/send', {
            sender: "ETCC",
            message: message,
            recipients: to,
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (response.data.status === 'success') {
            return { success: true, data: response.data };
        } else {
            throw new Error(response.data.message || 'Unknown Arkesel error');
        }
    } catch (error) {
        const errorDetails = error.response?.data?.message || error.response?.data || error.message;
        const errorMessage = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails);
        console.error('[Arkesel] SMS Error:', errorMessage);
        return { success: false, error: errorMessage };
    }
};

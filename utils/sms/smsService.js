import axios from 'axios';

/**
 * Send SMS via SMSOnlineGH API
 * @param {string|string[]} recipients - Single phone number or array of phone numbers
 * @param {string} message - The message content
 */
export const sendSMS = async (recipients, message) => {
    try {
        // Fallback to the hardcoded test values if env variables are not yet set
        const apiKey = process.env.SMSONLINEGH_API_KEY;
        const senderId = process.env.SMSONLINEGH_SENDER_ID || 'SADA';

        if (!apiKey) {
            console.error('[SMSOnlineGH] API Key is missing');
            return { success: false, error: 'SMS service not configured' };
        }

        // Ensure recipients is an array
        const to = Array.isArray(recipients) ? recipients : [recipients];

        // Format to international format for Ghana (removing leading 0s and ensuring 233)
        // (Doing this here ensures all SMS calls everywhere in the app are correctly formatted)
        const formattedTo = to.map(p => {
            let num = String(p).trim().replace(/\D/g, ''); // Remove non-digits
            if (num.startsWith('0')) {
                num = '233' + num.substring(1);
            } else if (num.startsWith('+')) {
                num = num.substring(1);
            }
            return num;
        });

        const response = await axios.post('https://api.smsonlinegh.com/v5/message/sms/send', {
            text: message,
            type: 0,
            sender: senderId,
            destinations: formattedTo
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `key ${apiKey}`
            }
        });

        // SMSOnlineGH handshake check
        if (response.data && response.data.handshake && response.data.handshake.id === 0) {
            return { success: true, data: response.data };
        } else {
            throw new Error(response.data?.handshake?.label || 'Unknown SMSOnlineGH error');
        }
    } catch (error) {
        const errorDetails = error.response?.data?.message || error.response?.data || error.message;
        const errorMessage = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails);
        console.error('[SMSOnlineGH] SMS Error:', errorMessage);
        return { success: false, error: errorMessage };
    }
};

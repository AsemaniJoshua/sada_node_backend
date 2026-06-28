import axios from 'axios';

/**
 * Request a fresh Access Token using the OAuth2 Refresh Token
 * @returns {Promise<string>} Access Token
 */
const getAccessToken = async () => {
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GMAIL_CLIENT_ID,
            client_secret: process.env.GMAIL_CLIENT_SECRET,
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token',
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Failed to refresh Gmail API Access Token:', error.response?.data || error.message);
        throw new Error('Gmail API authentication failed. Verify GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN.');
    }
};

/**
 * Centralized Send Email Utility using Gmail HTTPS REST API
 * (Bypasses outbound SMTP port block on hosting environments like Render/VPS)
 * 
 * @param {Object} options - Email options
 * @param {string} [options.to] - Recipient email
 * @param {string} [options.bcc] - BCC recipient(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Custom from header
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export const sendEmail = async ({ to, bcc, subject, html, from }) => {
    try {
        const accessToken = await getAccessToken();
        const sender = from || process.env.EMAIL_FROM || `"SADA" <${process.env.EMAIL_USER}>`;
        
        // Construct the RFC 2822 formatted email message
        const emailParts = [
            `From: ${sender}`,
            to ? `To: ${to}` : '',
            bcc ? `Bcc: ${bcc}` : '',
            `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`, // Base64 encode subject to support special characters safely
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset="utf-8"',
            'Content-Transfer-Encoding: base64',
            '',
            Buffer.from(html).toString('base64')
        ].filter(Boolean);

        const message = emailParts.join('\r\n');

        // Convert RFC 2822 string to base64url format required by the Gmail API
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // Post request to Gmail API (runs over HTTPS port 443, bypassing SMTP firewalls)
        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
            { raw: encodedMessage },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`Email sent successfully via Gmail API: ${response.data.id}`);
        return { success: true, messageId: response.data.id };
    } catch (error) {
        console.error('Gmail API send email failed:', error.response?.data || error.message);
        throw error;
    }
};

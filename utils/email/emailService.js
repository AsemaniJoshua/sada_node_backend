import nodemailer from 'nodemailer';

// Create email transporter using generic SMTP configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: process.env.EMAIL_SECURE === 'true' || (!process.env.EMAIL_PORT || process.env.EMAIL_PORT === '465'), // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000 // 10s timeout to prevent app hanging if SMTP is blocked
    });
};

/**
 * Centralized Send Email Utility
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
        const transporter = createTransporter();
        
        const mailOptions = {
            from: from || process.env.EMAIL_FROM || `"SADA" <${process.env.EMAIL_USER}>`,
            to,
            bcc,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to || 'BCC recipients'}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Failed to send email to ${to || 'BCC recipients'}:`, error.message);
        throw error;
    }
};

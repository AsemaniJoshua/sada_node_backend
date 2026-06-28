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
        tls: {
            rejectUnauthorized: false // Prevents SSL/TLS certificate verification failures on some hosts
        },
        connectionTimeout: 10000, // 10s connection timeout
        greetingTimeout: 10000,   // 10s handshake timeout
        socketTimeout: 15000      // 15s socket activity timeout
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
            // If sending to BCC only, set "to" as self to prevent spam filters from rejecting the mail
            to: to || (bcc ? process.env.EMAIL_USER : undefined),
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

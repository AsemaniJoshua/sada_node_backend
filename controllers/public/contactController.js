// Public contact controller
import nodemailer from 'nodemailer';
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { notifyAdmins, saveNotification } from '../../utils/notifications/pushService.js';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10000, // Fail fast in 10s to prevent Cloudflare 524 timeouts
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Create contact submission
const createContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return next(new AppError('Name is required and cannot be empty', 400, true));
        }

        if (!email || !email.trim()) {
            return next(new AppError('Email is required and cannot be empty', 400, true));
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return next(new AppError('Invalid email format', 400, true));
        }

        if (!subject || !subject.trim()) {
            return next(new AppError('Subject is required and cannot be empty', 400, true));
        }

        if (!message || !message.trim()) {
            return next(new AppError('Message is required and cannot be empty', 400, true));
        }

        // Create contact submission
        const contact = await prisma.contact.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim(),
            },
        });

        // Send email to info@example.com
        const mailOptions = {
            from: 'SADA Contact Form <' + process.env.EMAIL_USER + '>',
            to: 'joshuaasemani27@gmail.com',
            subject: `New Contact Form Submission: ${subject.trim()}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Contact Submission</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 40px 20px;
                            text-align: center;
                            color: #ffffff;
                        }
                        .header h1 {
                            font-size: 28px;
                            font-weight: 700;
                            margin-bottom: 8px;
                        }
                        .header p {
                            font-size: 14px;
                            opacity: 0.9;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .field {
                            margin-bottom: 28px;
                        }
                        .field-label {
                            font-size: 12px;
                            font-weight: 600;
                            color: #10b981;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 8px;
                        }
                        .field-value {
                            font-size: 14px;
                            color: #1f2937;
                            line-height: 1.6;
                            word-break: break-word;
                        }
                        .message-box {
                            background: #f9fafb;
                            border-left: 4px solid #10b981;
                            padding: 16px;
                            border-radius: 4px;
                            margin-top: 8px;
                        }
                        .divider {
                            height: 1px;
                            background: #e5e7eb;
                            margin: 30px 0;
                        }
                        .footer {
                            background: #f9fafb;
                            padding: 20px 30px;
                            border-top: 1px solid #e5e7eb;
                            font-size: 12px;
                            color: #6b7280;
                        }
                        .submission-id {
                            font-family: 'Monaco', 'Courier New', monospace;
                            background: #f3f4f6;
                            padding: 4px 8px;
                            border-radius: 3px;
                            color: #10b981;
                            font-weight: 600;
                        }
                        .meta-info {
                            margin-top: 12px;
                            font-size: 11px;
                            color: #9ca3af;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✉️ New Contact Submission</h1>
                            <p>Someone reached out to you via the contact form</p>
                        </div>

                        <div class="content">
                            <div class="field">
                                <div class="field-label">Sender Name</div>
                                <div class="field-value">${name.trim()}</div>
                            </div>

                            <div class="field">
                                <div class="field-label">Email Address</div>
                                <div class="field-value">
                                    <a href="mailto:${email.trim()}" style="color: #10b981; text-decoration: none;">${email.trim()}</a>
                                </div>
                            </div>

                            <div class="field">
                                <div class="field-label">Subject</div>
                                <div class="field-value">${subject.trim()}</div>
                            </div>

                            <div class="field">
                                <div class="field-label">Message</div>
                                <div class="message-box">
                                    <div class="field-value">${message.trim().replace(/\n/g, '<br>')}</div>
                                </div>
                            </div>

                            <div class="divider"></div>
                        </div>

                        <div class="footer">
                            <div><strong>Submission Details</strong></div>
                            <div class="meta-info">ID: <span class="submission-id">${contact.id}</span></div>
                            <div class="meta-info">Received: ${new Date(contact.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })} UTC</div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
            } else {
                console.log('Email sent successfully:', info.response);
            }
        });

        // Send push notification to admins
        const notificationPayload = {
            title: 'New Contact Message!',
            body: `From: ${contact.name} - ${contact.subject}`,
            url: `/admin/contact/${contact.id}`
        };

        notifyAdmins(notificationPayload);
        saveNotification(notificationPayload);

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully.',
            // data: contact,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { createContact };

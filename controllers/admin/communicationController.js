import nodemailer from 'nodemailer';
import { prisma } from '../../config/config.js';
import { AppError } from '../../utils/error/AppError.js';
import { sendArkeselSMS } from '../../utils/sms/arkeselService.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { saveNotification } from '../../utils/notifications/pushService.js';

// Setup Nodemailer transporter with explicit host and port
const transporter = nodemailer.createTransport({
    service: 'gmail',
    // host: 'smtp.gmail.com',
    // port: 465,
    // secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Helper to fetch recipients based on target
 */
const getRecipients = async (target, targetId = null) => {
    let emails = [];
    let phones = [];
    let description = '';

    switch (target) {
        case 'all_approved':
            const approved = await prisma.membership.findMany({ where: { status: 'approved' } });
            emails = approved.map(m => m.email);
            phones = approved.map(m => m.phone);
            description = 'all approved members';
            break;

        case 'all_pending':
            const pending = await prisma.membership.findMany({ where: { status: 'pending' } });
            emails = pending.map(m => m.email);
            phones = pending.map(m => m.phone);
            description = 'all pending members';
            break;

        case 'all_admins':
            const admins = await prisma.user.findMany({ where: { role: 'admin' } });
            emails = admins.map(a => a.email);
            // Assuming admin phone might be in metadata or we check if they have a membership record
            description = 'all admins';
            break;

        case 'specific_member':
            if (!targetId) throw new Error('targetId is required for specific_member');
            const member = await prisma.membership.findUnique({ where: { id: targetId } });
            if (member) {
                emails = [member.email];
                phones = [member.phone];
            }
            description = `specific member: ${member?.firstName || targetId}`;
            break;

        case 'specific_admin':
            if (!targetId) throw new Error('targetId is required for specific_admin');
            const admin = await prisma.user.findUnique({ where: { id: targetId } });
            if (admin) {
                emails = [admin.email];
            }
            description = `specific admin: ${admin?.name || targetId}`;
            break;

        default:
            throw new Error('Invalid target selected');
    }

    return { emails, phones, description };
};

/**
 * Send Bulk/Single Email
 */
export const sendSystemEmail = async (req, res, next) => {
    try {
        const { target, targetId, subject, message } = req.body;

        if (!target || !subject || !message) {
            return next(new AppError('Target, subject, and message are required', 400, true));
        }

        const { emails, description } = await getRecipients(target, targetId);

        if (emails.length === 0) {
            return next(new AppError('No email addresses found for selected target', 404, true));
        }

        const mailOptions = {
            from: `"SADA Admin" <${process.env.EMAIL_USER}>`,
            bcc: emails.join(','), // Using BCC for bulk to hide emails from each other
            subject: subject,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #10b981;">Message from SADA Administration</h2>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">
                        This is an official communication from SADA.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Auth', // Using Auth category for admin communications
            entity: 'Communication',
            description: `Sent bulk email to ${description}`,
            metadata: { target, subject, recipientCount: emails.length }
        });

        // 1. Save to Communication History
        await prisma.communicationLog.create({
            data: {
                type: 'email',
                target,
                recipientCount: emails.length,
                subject,
                message,
                adminId: req.user.userId
            }
        });

        // 2. Save to Notification Inbox (For Admins)
        await saveNotification({
            title: 'Bulk Email Sent',
            body: `Admin sent email to ${description} (${emails.length} recipients)`,
            userId: req.user.userId
        });

        res.status(200).json({
            success: true,
            message: `Email successfully sent to ${emails.length} recipients.`,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Send Bulk/Single SMS
 */
export const sendSystemSMS = async (req, res, next) => {
    try {
        const { target, targetId, message } = req.body;

        if (!target || !message) {
            return next(new AppError('Target and message are required', 400, true));
        }

        const { phones, description } = await getRecipients(target, targetId);

        // Filter out empty phones and handle formatting
        let validPhones = phones.filter(p => p && p.trim().length >= 10);
        
        // Format to international format for Ghana (assuming Ghana context)
        validPhones = validPhones.map(p => {
            let num = p.trim().replace(/\D/g, ''); // Remove non-digits
            if (num.startsWith('0')) {
                num = '233' + num.substring(1);
            } else if (num.startsWith('+')) {
                num = num.substring(1);
            }
            return num;
        });

        if (validPhones.length === 0) {
            return next(new AppError('No valid phone numbers found for selected target', 404, true));
        }

        const result = await sendArkeselSMS(validPhones, message);

        if (result.success) {
            await logActivity({
                userId: req.user.userId,
                action: 'create',
                logType: 'Auth',
                entity: 'Communication',
                description: `Sent bulk SMS to ${description}`,
                metadata: { target, recipientCount: validPhones.length }
            });

            // 1. Save to Communication History
            await prisma.communicationLog.create({
                data: {
                    type: 'sms',
                    target,
                    recipientCount: validPhones.length,
                    message,
                    adminId: req.user.userId
                }
            });

            // 2. Save to Notification Inbox (For Admins)
            await saveNotification({
                title: 'Bulk SMS Sent',
                body: `Admin sent SMS to ${description} (${validPhones.length} recipients)`,
                userId: req.user.userId
            });

            res.status(200).json({
                success: true,
                message: `SMS successfully sent to ${validPhones.length} recipients.`,
                data: result.data
            });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

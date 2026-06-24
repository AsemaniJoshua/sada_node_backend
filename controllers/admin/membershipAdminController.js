// Admin membership controller - CRUD operations and approval/rejection
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { sendEmail } from '../../utils/email/emailService.js';
import { logActivity } from '../../utils/activity/logActivity.js';
import { saveNotification } from '../../utils/notifications/pushService.js';
import { sendSMS } from '../../utils/sms/smsService.js';
import { generateMemberId } from '../../utils/id/generateMemberId.js';

/**
 * Create new membership record (manual creation by admin)
 */
const createMembership = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            dob,
            age,
            placeOfBirth,
            gender,
            hometown,
            currentAddress,
            ethnicity,
            suburb,
            occupation,
            phone,
            email,
            fatherName,
            fatherHometown,
            fatherContact,
            motherName,
            motherHometown,
            motherContact,
            emergencyName,
            emergencyRelationship,
            emergencyOccupation,
            emergencyContact,
            declaration,
            notes,
        } = req.body;

        // Validate required fields
        if (
            !firstName ||
            !lastName ||
            !dob ||
            !age ||
            !placeOfBirth ||
            !gender ||
            !hometown ||
            !currentAddress ||
            !ethnicity ||
            !suburb ||
            !occupation ||
            !phone ||
            !email ||
            !fatherName ||
            !fatherHometown ||
            !fatherContact ||
            !motherName ||
            !motherHometown ||
            !motherContact ||
            !emergencyName ||
            !emergencyRelationship ||
            !emergencyOccupation ||
            !emergencyContact ||
            declaration === undefined
        ) {
            throw new AppError('All required fields must be provided', 400, true);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Invalid email format', 400, true);
        }

        // Check if email already registered
        const existingEmailMember = await prisma.membership.findUnique({
            where: { email },
        });

        if (existingEmailMember) {
            throw new AppError('Email already registered', 409, true);
        }

        // Check if phone already registered
        const existingPhoneMember = await prisma.membership.findUnique({
            where: { phone },
        });

        if (existingPhoneMember) {
            throw new AppError('Phone number already registered', 409, true);
        }

        // Generate unique member ID
        const memberId = await generateMemberId();

        // Create membership record
        const membership = await prisma.membership.create({
            data: {
                memberId,
                firstName,
                lastName,
                dob,
                age: parseInt(age),
                placeOfBirth,
                gender,
                hometown,
                currentAddress,
                ethnicity,
                suburb,
                occupation,
                phone,
                email,
                fatherName,
                fatherHometown,
                fatherContact,
                motherName,
                motherHometown,
                motherContact,
                emergencyName,
                emergencyRelationship,
                emergencyOccupation,
                emergencyContact,
                declaration,
                notes: notes || null,
                status: 'pending',
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Membership',
            entity: 'Membership',
            entityId: membership.id,
            description: `Created membership record for: ${membership.firstName} ${membership.lastName}`,
            metadata: { name: `${membership.firstName} ${membership.lastName}`, email: membership.email, status: membership.status },
        });

        res.status(201).json({
            success: true,
            message: 'Membership record created successfully.',
            data: membership,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all membership records (admin view - includes private notes and all statuses)
 */
const getAllMemberships = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status;
        }

        const [memberships, total] = await Promise.all([
            prisma.membership.findMany({
                where,
                include: {
                    payments: {
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.membership.count({ where })
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            data: memberships,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get membership record by ID (admin view - includes private notes)
 */
const getMembershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        const membership = await prisma.membership.findUnique({
            where: { id },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!membership) {
            throw new AppError('Membership record not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: membership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update membership record by ID (PATCH - partial update)
 */
const updateMembershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if membership record exists
        const existingMembership = await prisma.membership.findUnique({
            where: { id },
        });

        if (!existingMembership) {
            throw new AppError('Membership record not found', 404, true);
        }

        // Build update data from provided fields
        const updateData = {};
        const allowedFields = [
            'firstName',
            'lastName',
            'dob',
            'age',
            'placeOfBirth',
            'gender',
            'hometown',
            'currentAddress',
            'ethnicity',
            'suburb',
            'occupation',
            'phone',
            'email',
            'fatherName',
            'fatherHometown',
            'fatherContact',
            'motherName',
            'motherHometown',
            'motherContact',
            'emergencyName',
            'emergencyRelationship',
            'emergencyOccupation',
            'emergencyContact',
            'declaration',
            'notes',
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'age') {
                    updateData[field] = parseInt(req.body[field]);
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        // Update membership record
        const updatedMembership = await prisma.membership.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Membership',
            entity: 'Membership',
            entityId: id,
            description: `Updated membership record for: ${updatedMembership.firstName} ${updatedMembership.lastName}`,
            metadata: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Membership record updated successfully.',
            data: updatedMembership,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete membership record by ID
 */
const deleteMembershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if membership record exists
        const existingMembership = await prisma.membership.findUnique({
            where: { id },
        });

        if (!existingMembership) {
            throw new AppError('Membership record not found', 404, true);
        }

        // Delete membership record
        await prisma.membership.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Membership',
            entity: 'Membership',
            entityId: id,
            description: `Deleted membership record for: ${existingMembership.firstName} ${existingMembership.lastName}`,
            metadata: { id, name: `${existingMembership.firstName} ${existingMembership.lastName}`, email: existingMembership.email },
        });

        // Save notification for history (Admin Inbox)
        saveNotification({
            title: 'Membership Deleted',
            body: `Admin deleted membership record for ${existingMembership.firstName} ${existingMembership.lastName}.`,
        });

        res.status(200).json({
            success: true,
            message: 'Membership record deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Approve membership application
 * Sends approval email to applicant
 */
const approveMembership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if membership record exists
        const existingMembership = await prisma.membership.findUnique({
            where: { id },
        });

        if (!existingMembership) {
            throw new AppError('Membership record not found', 404, true);
        }

        // Update membership status to approved
        const approvedMembership = await prisma.membership.update({
            where: { id },
            data: {
                status: 'approved',
                notes: notes || existingMembership.notes,
            },
        });

        // Send approval email
        const mailOptions = {
            from: 'SADA <' + process.env.EMAIL_USER + '>',
            to: existingMembership.email,
            subject: 'Membership Application Approved - SADA',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Membership Approved</title>
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
                        .content {
                            padding: 40px 30px;
                        }
                        .content p {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 16px;
                        }
                        .success-box {
                            background: #d1fae5;
                            border-left: 4px solid #10b981;
                            padding: 16px;
                            margin: 24px 0;
                            border-radius: 4px;
                            color: #065f46;
                        }
                        .footer {
                            background: #f9fafb;
                            padding: 20px 30px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #e5e7eb;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Congratulations!</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${existingMembership.firstName} ${existingMembership.lastName},</p>
                            <p>We are delighted to inform you that your membership application has been <strong>APPROVED</strong>!</p>
                            
                            <div class="success-box">
                                <strong>Welcome to SADA Family!</strong>
                                <p>Your Membership ID: <strong>${existingMembership.memberId}</strong></p>
                                <p>You are now an approved member. Thank you for joining our organization.</p>
                            </div>
                            
                            <p>If you have any questions, please feel free to contact us.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 SADA. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        // Send email asynchronously
        sendEmail(mailOptions).catch((error) => {
            console.error('Error sending approval email:', error);
        });

        // Send SMS asynchronously
        const smsMessage = `Congratulations ${existingMembership.firstName}! Your SADA Membership ID is ${existingMembership.memberId}. Welcome to the family!`;
        sendSMS(existingMembership.phone, smsMessage).catch(err => {
            console.error('Error sending approval SMS:', err);
        });

        await logActivity({
            userId: req.user.userId,
            action: 'approve',
            logType: 'Membership',
            entity: 'Membership',
            entityId: id,
            description: `Approved membership for: ${existingMembership.firstName} ${existingMembership.lastName}`,
            metadata: { name: `${existingMembership.firstName} ${existingMembership.lastName}`, email: existingMembership.email },
        });

        // Save notification for history (Admin Inbox)
        saveNotification({
            title: 'Membership Approved',
            body: `Admin approved ${existingMembership.firstName} ${existingMembership.lastName}'s membership.`,
            url: `/admin/membership/${id}`
        });

        res.status(200).json({
            success: true,
            message: 'Membership approved and notification email sent.',
            data: approvedMembership,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject membership application
 * Sends rejection email to applicant
 */
const rejectMembership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason, notes } = req.body;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Validate reason is provided
        if (!reason || !reason.trim()) {
            throw new AppError('Rejection reason is required', 400, true);
        }

        // Check if membership record exists
        const existingMembership = await prisma.membership.findUnique({
            where: { id },
        });

        if (!existingMembership) {
            throw new AppError('Membership record not found', 404, true);
        }

        // Update membership status to rejected
        const rejectedMembership = await prisma.membership.update({
            where: { id },
            data: {
                status: 'rejected',
                notes: notes || existingMembership.notes,
            },
        });

        // Send rejection email
        const mailOptions = {
            from: 'SADA <' + process.env.EMAIL_USER + '>',
            to: existingMembership.email,
            subject: 'Membership Application Status Update - SADA',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Membership Application Status</title>
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
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            padding: 40px 20px;
                            text-align: center;
                            color: #ffffff;
                        }
                        .header h1 {
                            font-size: 28px;
                            font-weight: 700;
                            margin-bottom: 8px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content p {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 16px;
                        }
                        .reason-box {
                            background: #fee2e2;
                            border-left: 4px solid #ef4444;
                            padding: 16px;
                            margin: 24px 0;
                            border-radius: 4px;
                            color: #7f1d1d;
                        }
                        .reason-box strong {
                            display: block;
                            margin-bottom: 8px;
                        }
                        .footer {
                            background: #f9fafb;
                            padding: 20px 30px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #e5e7eb;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Application Status Update</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${existingMembership.firstName} ${existingMembership.lastName},</p>
                            <p>Thank you for your interest in joining SADA. We have reviewed your membership application.</p>
                            
                            <div class="reason-box">
                                <strong>Application Status: Rejected</strong>
                                <p><strong>Reason:</strong> ${reason}</p>
                            </div>
                            
                            <p>If you would like to reapply or have any questions about this decision, please feel free to contact us.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 SADA. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        // Send email asynchronously
        sendEmail(mailOptions).catch((error) => {
            console.error('Error sending rejection email:', error);
        });

        // Send SMS asynchronously
        const smsMessage = `Hello ${existingMembership.firstName}, your SADA membership application status has been updated. Result: Rejected. Reason: ${reason}. Please check your email for details.`;
        sendSMS(existingMembership.phone, smsMessage).catch(err => {
            console.error('Error sending rejection SMS:', err);
        });

        await logActivity({
            userId: req.user.userId,
            action: 'reject',
            logType: 'Membership',
            entity: 'Membership',
            entityId: id,
            description: `Rejected membership for: ${existingMembership.firstName} ${existingMembership.lastName}`,
            metadata: { name: `${existingMembership.firstName} ${existingMembership.lastName}`, email: existingMembership.email, reason },
        });

        // Save notification for history (Admin Inbox)
        saveNotification({
            title: 'Membership Rejected',
            body: `Admin rejected ${existingMembership.firstName} ${existingMembership.lastName}'s membership.`,
            url: `/admin/membership/${id}`
        });

        res.status(200).json({
            success: true,
            message: 'Membership rejected and notification email sent.',
            data: rejectedMembership,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get membership record by Member ID (Admin)
 */
const getMemberByMemberId = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        if (!memberId) {
            throw new AppError('Member ID is required', 400, true);
        }

        const membership = await prisma.membership.findUnique({
            where: { memberId },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!membership) {
            throw new AppError('Membership record not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: membership
        });
    } catch (error) {
        next(error);
    }
};

export {
    createMembership,
    getAllMemberships,
    getMembershipById,
    getMemberByMemberId,
    updateMembershipById,
    deleteMembershipById,
    approveMembership,
    rejectMembership,
};

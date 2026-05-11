// Public membership controller - Member registration and read operations
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import nodemailer from 'nodemailer';
import { notifyAdmins } from '../../utils/notifications/pushService.js';

// Create nodemailer transporter for membership confirmation emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Register as a member
 * Creates a new membership record with pending status
 */
const registerMember = async (req, res, next) => {
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
            throw new AppError('All fields are required', 400, true);
        }

        // Validate declaration
        if (declaration !== true) {
            throw new AppError('You must accept the declaration', 400, true);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Invalid email format', 400, true);
        }

        // Validate phone format (basic validation)
        if (!phone || phone.trim().length < 10) {
            throw new AppError('Invalid phone number', 400, true);
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

        // Create membership record
        const membership = await prisma.membership.create({
            data: {
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
                status: 'pending',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                status: true,
                createdAt: true,
            },
        });

        // Send confirmation email
        const mailOptions = {
            from: 'SADA <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Membership Application Received - SADA',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Membership Application</title>
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
                        .info-box {
                            background: #f3f4f6;
                            border-left: 4px solid #10b981;
                            padding: 16px;
                            margin: 24px 0;
                            border-radius: 4px;
                        }
                        .info-box strong {
                            color: #10b981;
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
                            <h1>🎉 Welcome to SADA</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${firstName} ${lastName},</p>
                            <p>Thank you for applying to become a member of SADA. We have received your membership application and it is currently under review.</p>
                            
                            <div class="info-box">
                                <strong>Application Status: <span style="color: #f59e0b;">Pending Review</span></strong>
                                <p>Our team will review your application and contact you shortly.</p>
                            </div>
                            
                            <p>We appreciate your interest and commitment. If you have any questions, please feel free to contact us.</p>
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
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error('Error sending membership confirmation email:', error);
            }
        });

        // Send push notification to admins
        notifyAdmins({
            title: 'New Membership Application!',
            body: `${membership.firstName} ${membership.lastName} has applied.`,
            url: `/admin/membership/${membership.id}`
        });

        res.status(201).json({
            success: true,
            message: 'Membership application submitted successfully. Please check your email for confirmation.',
            data: membership,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all approved memberships (public - no private notes)
 */
const getAllMemberships = async (req, res, next) => {
    try {
        const memberships = await prisma.membership.findMany({
            where: {
                status: 'approved',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                occupation: true,
                hometown: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: memberships,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get approved membership by ID (public - no private notes)
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
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                occupation: true,
                hometown: true,
                status: true,
                createdAt: true,
            },
        });

        if (!membership || membership.status !== 'approved') {
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

export {
    registerMember,
    getAllMemberships,
    getMembershipById,
};

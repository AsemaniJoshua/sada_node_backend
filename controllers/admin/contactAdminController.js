// Admin contact controller - View form submissions
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { logActivity } from '../../utils/activity/logActivity.js';

// Get all contact submissions
const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            success: true,
            data: contacts,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Get contact submission by ID
const getContactById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const contact = await prisma.contact.findUnique({
            where: { id },
        });

        if (!contact) {
            return next(new AppError('Contact submission not found', 404, true));
        }

        res.status(200).json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

// Delete contact submission by ID
const deleteContactById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find contact
        const contact = await prisma.contact.findUnique({
            where: { id },
        });

        if (!contact) {
            return next(new AppError('Contact submission not found', 404, true));
        }

        // Delete contact from database
        await prisma.contact.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Contact',
            entity: 'Contact',
            entityId: id,
            description: `Deleted contact submission from: ${contact.name} (${contact.email})`,
            metadata: { id, name: contact.name, email: contact.email, subject: contact.subject },
        });

        res.status(200).json({
            success: true,
            message: 'Contact submission deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllContacts, getContactById, deleteContactById };

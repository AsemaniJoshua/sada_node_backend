// Admin membership controller - CRUD operations for membership
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Create new membership record
 * For singleton, typically only 1 record should exist
 */
const createMembership = async (req, res, next) => {
    try {
        const { benefits, requirements } = req.body;

        // Validate required fields
        if (!benefits || !requirements) {
            throw new AppError('benefits and requirements are required', 400, true);
        }

        // Validate both are arrays
        if (!Array.isArray(benefits) || !Array.isArray(requirements)) {
            throw new AppError('benefits and requirements must be arrays', 400, true);
        }

        // Create membership record
        const membership = await prisma.membership.create({
            data: {
                benefits,
                requirements,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Membership created successfully.',
            data: membership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all membership records
 * For singleton, should return array with 1 record
 */
const getAllMemberships = async (req, res, next) => {
    try {
        const memberships = await prisma.membership.findMany({
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
 * Get membership record by ID
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
        const { benefits, requirements } = req.body;

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

        // Validate array fields if provided
        if (benefits && !Array.isArray(benefits)) {
            throw new AppError('benefits must be an array', 400, true);
        }

        if (requirements && !Array.isArray(requirements)) {
            throw new AppError('requirements must be an array', 400, true);
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (benefits !== undefined) updateData.benefits = benefits;
        if (requirements !== undefined) updateData.requirements = requirements;

        // Update membership record
        const updatedMembership = await prisma.membership.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Membership updated successfully.',
            data: updatedMembership,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
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

        res.status(200).json({
            success: true,
            message: 'Membership deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createMembership,
    getAllMemberships,
    getMembershipById,
    updateMembershipById,
    deleteMembershipById,
};

// Admin events controller - CRUD operations with image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../config/cloudinaryUpload.js';
import { logActivity } from '../../utils/activity/logActivity.js';

/**
 * Create new event with banner image
 * Banner image is required for event creation
 */
const createEvent = async (req, res, next) => {
    try {
        const { title, event_type, location, description, start_date, start_time, status } = req.body;
        const file = req.file;

        // Validate required fields
        if (!title || !event_type || !location || !description || !start_date || !start_time) {
            throw new AppError('title, event_type, location, description, start_date, and start_time are required', 400, true);
        }

        // Validate banner image is provided (required)
        if (!file) {
            throw new AppError('Event banner image is required', 400, true);
        }

        // Validate start_time format (HH:MM)
        if (!/^\d{2}:\d{2}$/.test(start_time)) {
            throw new AppError('start_time must be in HH:MM format (24-hour)', 400, true);
        }

        // Validate date format
        const eventDate = new Date(start_date);
        if (isNaN(eventDate.getTime())) {
            throw new AppError('Invalid start_date format', 400, true);
        }

        // Validate status enum
        const validStatuses = ['draft', 'upcoming', 'live', 'past', 'cancelled'];
        const normalizedStatus = status ? status.toLowerCase() : 'draft';
        if (!validStatuses.includes(normalizedStatus)) {
            throw new AppError('Invalid status. Must be one of: draft, upcoming, live, past, cancelled', 400, true);
        }

        // Upload banner image to Cloudinary
        let uploadedBanner = null;
        try {
            uploadedBanner = await uploadImageToCloudinary(file.buffer, 'events/banners');
        } catch (uploadError) {
            throw uploadError;
        }

        // Create event with uploaded banner
        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                event_type: event_type.trim(),
                location: location.trim(),
                description: description.trim(),
                event_banner: uploadedBanner,
                start_date: eventDate,
                start_time: start_time.trim(),
                status: normalizedStatus,
            },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'create',
            logType: 'Events',
            entity: 'Event',
            entityId: event.id,
            description: `Created event: "${event.title}"`,
            metadata: { title: event.title, event_type: event.event_type, status: event.status },
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully.',
            data: event,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all events (admin view) with optional filters
 */
const getAllEvents = async (req, res, next) => {
    try {
        const { status, event_type } = req.query;

        // Build filter conditions
        const where = {};

        if (status) {
            const validStatuses = ['draft', 'upcoming', 'live', 'past', 'cancelled'];
            const normalizedStatus = status.toLowerCase();
            if (!validStatuses.includes(normalizedStatus)) {
                throw new AppError('Invalid status. Must be one of: draft, upcoming, live, past, cancelled', 400, true);
            }
            where.status = normalizedStatus;
        }

        if (event_type) {
            where.event_type = event_type;
        }

        // Fetch all events ordered by start_date ascending (earliest first)
        const events = await prisma.event.findMany({
            where,
            orderBy: { start_date: 'asc' },
        });

        res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Fetch event by ID
        const event = await prisma.event.findUnique({
            where: { id },
        });

        // Check if event exists
        if (!event) {
            throw new AppError('Event not found', 404, true);
        }

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update event by ID (PATCH - partial update)
 * Can update title, event_type, location, description, status, dates, and/or banner
 * If new banner provided, old banner is auto-deleted from Cloudinary
 */
const updateEventById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, event_type, location, description, start_date, start_time, status } = req.body;
        const file = req.file;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
            where: { id },
        });

        if (!existingEvent) {
            throw new AppError('Event not found', 404, true);
        }

        // Validate start_time format if provided
        if (start_time && !/^\d{2}:\d{2}$/.test(start_time)) {
            throw new AppError('start_time must be in HH:MM format (24-hour)', 400, true);
        }

        // Validate date if provided
        let eventDate = null;
        if (start_date) {
            eventDate = new Date(start_date);
            if (isNaN(eventDate.getTime())) {
                throw new AppError('Invalid start_date format', 400, true);
            }
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['draft', 'upcoming', 'live', 'past', 'cancelled'];
            const normalizedStatus = status.toLowerCase();
            if (!validStatuses.includes(normalizedStatus)) {
                throw new AppError('Invalid status. Must be one of: draft, upcoming, live, past, cancelled', 400, true);
            }
        }

        // Handle banner upload/replacement if new banner provided
        let uploadedBanner = null;
        if (file) {
            try {
                uploadedBanner = await uploadImageToCloudinary(file.buffer, 'events/banners');
            } catch (uploadError) {
                throw uploadError;
            }

            // Delete old banner from Cloudinary if new banner provided
            if (existingEvent.event_banner && existingEvent.event_banner.public_id) {
                try {
                    await deleteImageFromCloudinary(existingEvent.event_banner.public_id);
                } catch (deleteError) {
                    // Log but don't fail if deletion fails
                    console.error('Failed to delete old banner:', deleteError);
                }
            }
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (event_type !== undefined) updateData.event_type = event_type.trim();
        if (location !== undefined) updateData.location = location.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (eventDate !== null) updateData.start_date = eventDate;
        if (start_time !== undefined) updateData.start_time = start_time.trim();
        if (status !== undefined) updateData.status = status.toLowerCase();
        if (uploadedBanner !== null) updateData.event_banner = uploadedBanner;

        // Update event
        const updatedEvent = await prisma.event.update({
            where: { id },
            data: updateData,
        });

        await logActivity({
            userId: req.user.userId,
            action: 'update',
            logType: 'Events',
            entity: 'Event',
            entityId: id,
            description: `Updated event: "${updatedEvent.title}"`,
            metadata: { title: updatedEvent.title, status: updatedEvent.status },
        });

        res.status(200).json({
            success: true,
            message: 'Event updated successfully.',
            data: updatedEvent,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete event by ID with Cloudinary image cleanup
 */
const deleteEventById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Get event to extract banner public_id
        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            throw new AppError('Event not found', 404, true);
        }

        // Delete banner from Cloudinary
        if (event.event_banner && event.event_banner.public_id) {
            try {
                await deleteImageFromCloudinary(event.event_banner.public_id);
            } catch (deleteError) {
                // Log but don't fail if deletion fails
                console.error('Failed to delete event banner:', deleteError);
            }
        }

        // Delete event from database
        await prisma.event.delete({
            where: { id },
        });

        await logActivity({
            userId: req.user.userId,
            action: 'delete',
            logType: 'Events',
            entity: 'Event',
            entityId: id,
            description: `Deleted event: "${event.title}"`,
            metadata: { id, title: event.title, event_type: event.event_type },
        });

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createEvent,
    getAllEvents,
    getEventById,
    updateEventById,
    deleteEventById,
};

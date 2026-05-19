import { prisma } from '../../config/config.js';

/**
 * Generates a unique 6-character alphanumeric Membership ID
 * Format: SADA-XXXXXX (where X is alphanumeric)
 */
/**
 * Generates a sequential 6-digit Membership ID
 * Starts from 100001 and increments
 */
export const generateMemberId = async () => {
    // Find the member with the highest numeric memberId
    const lastMember = await prisma.membership.findFirst({
        where: {
            memberId: {
                not: 'TEMP',
            },
        },
        orderBy: {
            memberId: 'desc',
        },
    });

    let nextId;

    if (!lastMember || !lastMember.memberId) {
        // Start from 100001 if no members exist
        nextId = 100001;
    } else {
        // Increment the last ID
        const lastId = parseInt(lastMember.memberId);
        
        // Handle cases where the ID might not be a valid number or has reached the limit
        if (isNaN(lastId)) {
            nextId = 100001;
        } else {
            nextId = lastId + 1;
        }
    }

    // Format to 6 digits (e.g., 000001 if starting from 1)
    // But since we start from 100001, it will naturally be 6 digits
    return nextId.toString().padStart(6, '0');
};

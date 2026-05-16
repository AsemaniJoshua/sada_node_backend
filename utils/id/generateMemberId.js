import { prisma } from '../../config/config.js';

/**
 * Generates a unique 6-character alphanumeric Membership ID
 * Format: SADA-XXXXXX (where X is alphanumeric)
 */
export const generateMemberId = async () => {
    const chars = '1234567890';
    let isUnique = false;
    let memberId = '';

    while (!isUnique) {
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        memberId = result;

        // Check database for uniqueness
        const existing = await prisma.membership.findUnique({
            where: { memberId }
        });

        if (!existing) {
            isUnique = true;
        }
    }

    return memberId;
};

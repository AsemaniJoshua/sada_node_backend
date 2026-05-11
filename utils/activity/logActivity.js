// Activity logger utility
// Fire-and-forget: a log failure NEVER breaks an API response.
import { prisma } from '../../config/config.js';

/**
 * Log an admin activity to the database.
 * @param {Object} params
 * @param {string}  params.userId      - The ID of the admin performing the action
 * @param {string}  params.action      - ActivityAction enum: create | update | delete | approve | reject
 * @param {string}  params.logType     - ActivityLogType enum: Blog | Events | Membership | etc.
 * @param {string}  params.entity      - Model name, e.g. "BlogPost", "Hero"
 * @param {string}  [params.entityId]  - ID of the affected record (optional)
 * @param {string}  params.description - Human-readable summary, e.g. "Created blog post: My Title"
 * @param {Object}  [params.metadata]  - Optional extra context (title, name, status, etc.)
 */
const logActivity = async ({ userId, action, logType, entity, entityId = null, description, metadata = null }) => {
    try {
        await prisma.userActivity.create({
            data: {
                userId,
                action,
                logType,
                entity,
                entityId,
                description,
                metadata,
            },
        });
    } catch (err) {
        // Never let a logging failure crash the main request
        console.error(`[ActivityLog] Failed to log activity (${action} on ${entity}):`, err.message);
    }
};

export { logActivity };

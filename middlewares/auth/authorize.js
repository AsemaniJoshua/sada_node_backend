// Authorization middleware - Check user role
import { AppError } from '../../utils/error/AppError.js';

/**
 * Middleware factory to check if user has required role
 * @param {String|Array} requiredRole - Role(s) required to access route (e.g., 'admin' or ['admin', 'user'])
 * @returns {Function} Middleware function
 */
const authorize = (requiredRole) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated (req.user should be set by authenticate middleware)
            if (!req.user) {
                throw new AppError('Unauthorized: User not authenticated', 401, true);
            }

            // Convert requiredRole to array for uniform handling
            const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                throw new AppError('Forbidden: Insufficient permissions', 403, true);
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                return next(error);
            }
            
            next(new AppError('Forbidden: Access denied', 403, true));
        }
    };
};

export { authorize };

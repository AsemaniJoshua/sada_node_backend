// Authentication middleware - Verify JWT token
import { AppError } from '../../utils/error/AppError.js';
import { verifyAccessToken } from '../../utils/jwt/jwt.js';

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches user data to req.user if token is valid
 */
const authenticate = (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        // Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Unauthorized: No token provided', 401, true);
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.slice(7);

        // Verify and decode token
        const decoded = verifyAccessToken(token);

        // Attach user info to request object
        req.user = decoded;

        next();
    } catch (error) {
        // Handle token verification errors
        if (error instanceof AppError) {
            return next(error);
        }
        
        next(new AppError('Unauthorized: Invalid or expired token', 401, true));
    }
};

export { authenticate };

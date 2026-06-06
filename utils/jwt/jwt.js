import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Secret keys from environment variables
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';

// Access token expiry: 1 day
const ACCESS_TOKEN_EXPIRY = '1d';

// Refresh token expiry: 14 days
const REFRESH_TOKEN_EXPIRY = '14d';

/**
 * Generate access token for user
 * @param {String} userId - User ID
 * @param {String} role - User role (admin or user)
 * @returns {String} JWT access token
 */
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Generate refresh token for user
 * @param {String} userId - User ID
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

/**
 * Verify and decode access token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new Error(`Invalid or expired access token: ${error.message}`);
    }
};

/**
 * Verify and decode refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error(`Invalid or expired refresh token: ${error.message}`);
    }
};

/**
 * Decode token without verification (for debugging)
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
};

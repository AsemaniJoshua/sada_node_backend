// Cloudinary upload and delete utilities
import cloudinary from './cloudinary.js';
import fs from 'fs';
import { AppError } from '../utils/error/AppError.js';

/**
 * Upload image to Cloudinary from file path
 * @param {String} filePath - Local file path from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} { url, public_id }
 */
const uploadImageToCloudinary = async (filePath, folder) => {
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            throw new AppError('File not found', 400, true);
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `sada/${folder}`,
            resource_type: 'auto',
            quality: 'auto',
        });

        // Delete temporary file after successful upload
        fs.unlinkSync(filePath);

        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        // Delete temporary file if upload fails
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        throw new AppError(`Cloudinary upload failed: ${error.message}`, 500, true);
    }
};

/**
 * Delete image from Cloudinary by public_id
 * @param {String} publicId - Cloudinary public_id
 */
const deleteImageFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return; // Skip if no public_id

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error(`Failed to delete image from Cloudinary: ${error.message}`);
        // Don't throw error - deletion failure shouldn't block the process
    }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public_ids
 */
const deleteMultipleImagesFromCloudinary = async (publicIds) => {
    try {
        if (!publicIds || publicIds.length === 0) return;

        for (const publicId of publicIds) {
            await deleteImageFromCloudinary(publicId);
        }
    } catch (error) {
        console.error(`Failed to delete multiple images: ${error.message}`);
    }
};

export {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    deleteMultipleImagesFromCloudinary,
};

// Cloudinary upload and delete utilities
import cloudinary from './cloudinary.js';
import fs from 'fs';
import { Readable } from 'stream';
import { AppError } from '../utils/error/AppError.js';

/**
 * Upload image to Cloudinary from buffer or file path
 * @param {Buffer|String} fileData - Buffer from multer memory storage or file path
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} { url, public_id }
 */
const uploadImageToCloudinary = async (fileData, folder) => {
    try {
        let uploadStream;

        // Handle both buffer (memory storage) and file path (disk storage)
        if (Buffer.isBuffer(fileData)) {
            // If it's a buffer, convert it to a readable stream
            uploadStream = Readable.from(fileData);
        } else if (typeof fileData === 'string') {
            // If it's a file path, check if file exists
            if (!fs.existsSync(fileData)) {
                throw new AppError('File not found', 400, true);
            }
            uploadStream = fs.createReadStream(fileData);
        } else {
            throw new AppError('Invalid file data', 400, true);
        }

        // Upload to Cloudinary
        return new Promise((resolve, reject) => {
            const uploadPromise = cloudinary.uploader.upload_stream(
                {
                    folder: `sada/${folder}`,
                    resource_type: 'auto',
                    quality: 'auto',
                },
                (error, result) => {
                    if (error) {
                        reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500, true));
                    } else {
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id,
                        });
                    }
                }
            );

            uploadStream.pipe(uploadPromise);
        });
    } catch (error) {
        // Delete temporary file if it was a file path
        if (typeof fileData === 'string' && fs.existsSync(fileData)) {
            fs.unlinkSync(fileData);
        }

        throw new AppError(
            `Upload failed: ${error.message}`,
            500,
            true
        );
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

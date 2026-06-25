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

/**
 * Intercept html/markdown content, upload any base64 inline images to Cloudinary,
 * and replace the base64 src with the resulting Cloudinary HTTPS URL.
 * @param {String} htmlContent - Raw HTML/Markdown string from rich-text editor
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} Cleaned HTML/Markdown content with CDN URLs
 */
const processRichTextImages = async (htmlContent, folder = 'rich-text') => {
    if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;

    // Regex to match base64 data URIs inside img src attributes
    const regex = /src=["'](data:image\/[a-zA-Z+.-]+;base64,[^"']+)["']/g;
    let match;
    let updatedContent = htmlContent;

    // Collect all unique base64 URIs to prevent redundant uploads
    const matches = new Set();
    while ((match = regex.exec(htmlContent)) !== null) {
        matches.add(match[1]);
    }

    // Upload each base64 image to Cloudinary and replace it in the content
    for (const dataUri of matches) {
        try {
            // Cloudinary natively supports uploading base64 data URIs
            const result = await cloudinary.uploader.upload(dataUri, {
                folder: `sada/${folder}`,
                resource_type: 'image',
                quality: 'auto',
            });

            // Replace all occurrences of this base64 URI with the secure URL
            updatedContent = updatedContent.split(dataUri).join(result.secure_url);
        } catch (error) {
            console.error('[processRichTextImages] Base64 image upload failed:', error.message);
            // Fallback: keep the original base64 string so the user doesn't lose the image
        }
    }

    return updatedContent;
};

export {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    deleteMultipleImagesFromCloudinary,
    processRichTextImages,
};

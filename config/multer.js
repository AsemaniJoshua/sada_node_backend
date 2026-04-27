// Multer configuration for file uploads
import multer from 'multer';
import path from 'path';

// Use memory storage to avoid file system issues in production
// Files are stored in RAM and passed as buffers to Cloudinary
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
};

// Multer middleware configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB file size limit
    },
    fileFilter: fileFilter,
});

export default upload;

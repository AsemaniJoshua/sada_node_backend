// Multer configuration for file uploads
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for temporary file storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store uploaded files temporarily in /tmp or project temp folder
        cb(null, path.join(__dirname, '../tmp'));
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

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

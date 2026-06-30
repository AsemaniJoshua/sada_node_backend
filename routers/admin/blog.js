// Admin blog routes with CRUD operations and image upload
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import upload from '../../config/multer.js';
import {
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPostById,
    deleteBlogPostById,
    getBlogPostBySlug,
} from '../../controllers/admin/blogAdminController.js';

const router = express.Router();

// Create new blog post with optional image upload (multiple images allowed)
router.post('/', authenticate, authorize('admin'), upload.array('images', 10), createBlogPost);

// Get all blog posts
router.get('/', authenticate, authorize('admin'), getAllBlogPosts);

// Get blog post by slug
router.get('/slug/:slug', authenticate, authorize('admin'), getBlogPostBySlug);

// Get blog post by ID
router.get('/:id', authenticate, authorize('admin'), getBlogPostById);

// Update blog post by ID with optional image upload
router.patch('/:id', authenticate, authorize('admin'), upload.array('images', 10), updateBlogPostById);

// Delete blog post by ID
router.delete('/:id', authenticate, authorize('admin'), deleteBlogPostById);

export default router;

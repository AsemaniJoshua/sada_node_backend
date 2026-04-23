// Public blog routes
import express from 'express';
import { getAllBlogPosts, getBlogPostById } from '../../controllers/public/blogController.js';

const router = express.Router();

// Get all blog posts
router.get('/', getAllBlogPosts);

// Get blog post by ID
router.get('/:id', getBlogPostById);

export default router;

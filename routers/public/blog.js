import express from 'express';
import { getAllBlogPosts, getBlogPostById, getBlogPostBySlug } from '../../controllers/public/blogController.js';

const router = express.Router();

// Get all blog posts
router.get('/', getAllBlogPosts);

// Get blog post by slug
router.get('/slug/:slug', getBlogPostBySlug);

// Get blog post by ID
router.get('/:id', getBlogPostById);

export default router;

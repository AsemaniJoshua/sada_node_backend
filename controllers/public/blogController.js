// Public blog controller - Fetch blog posts data
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all blog posts
 * Ordered by latest first (createdAt desc)
 */
const getAllBlogPosts = async (req, res, next) => {
    try {
        // Fetch all blog posts ordered by latest first
        const blogPosts = await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Return blog posts data
        res.status(200).json({
            success: true,
            data: blogPosts,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get blog post by ID
 */
const getBlogPostById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Fetch blog post by ID
        const blogPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        // Check if blog post exists
        if (!blogPost) {
            throw new AppError('Blog post not found', 404, true);
        }

        // Return blog post data
        res.status(200).json({
            success: true,
            data: blogPost,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getAllBlogPosts, getBlogPostById };

// Public blog controller - Fetch blog posts data
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get all published blog posts
 * Ordered by latest first (createdAt desc)
 * Supports filtering by category and tags
 */
const getAllBlogPosts = async (req, res, next) => {
    try {
        const { category, tag } = req.query;

        // Build filter conditions - only published
        const where = {
            status: 'published',
        };

        if (category) {
            if (!['news', 'blog', 'article'].includes(category)) {
                throw new AppError('category must be "news", "blog", or "article"', 400, true);
            }
            where.category = category;
        }

        // Fetch published blog posts ordered by latest first
        let blogPosts = await prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Filter by tag if provided (JSON array contains)
        if (tag) {
            blogPosts = blogPosts.filter(post => 
                Array.isArray(post.tags) && post.tags.includes(tag)
            );
        }

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
 * Get published blog post by ID
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

        // Check if blog post exists and is published
        if (!blogPost) {
            throw new AppError('Blog post not found', 404, true);
        }

        if (blogPost.status !== 'published') {
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

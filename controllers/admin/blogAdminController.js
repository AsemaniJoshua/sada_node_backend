// Admin blog controller - CRUD operations for blog posts with image management
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';
import { uploadImageToCloudinary, deleteMultipleImagesFromCloudinary } from '../../config/cloudinaryUpload.js';

/**
 * Create new blog post with optional images and tags
 */
const createBlogPost = async (req, res, next) => {
    try {
        const { title, content, category, status, tags } = req.body;
        const files = req.files;

        // Validate required fields
        if (!title || !content || !category) {
            throw new AppError('title, content, and category are required', 400, true);
        }

        // Validate title is non-empty string
        if (typeof title !== 'string' || title.trim() === '') {
            throw new AppError('title must be a non-empty string', 400, true);
        }

        // Validate content is non-empty string
        if (typeof content !== 'string' || content.trim() === '') {
            throw new AppError('content must be a non-empty string', 400, true);
        }

        // Validate category
        if (!['news', 'blog', 'article'].includes(category)) {
            throw new AppError('category must be "news", "blog", or "article"', 400, true);
        }

        // Validate status if provided
        if (status && !['draft', 'published'].includes(status)) {
            throw new AppError('status must be "draft" or "published"', 400, true);
        }

        // Validate tags if provided
        let parsedTags = [];
        if (tags) {
            if (!Array.isArray(tags)) {
                throw new AppError('tags must be an array of strings', 400, true);
            }
            parsedTags = tags.filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim());
        }

        // Upload images if provided
        let uploadedImages = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'blog');
                    uploadedImages.push(cloudinaryImage);
                } catch (uploadError) {
                    // Cleanup already uploaded images if new upload fails
                    if (uploadedImages.length > 0) {
                        await deleteMultipleImagesFromCloudinary(
                            uploadedImages.map(img => img.public_id)
                        );
                    }
                    throw uploadError;
                }
            }
        }

        // Create blog post with uploaded images
        const blogPost = await prisma.blogPost.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                category,
                status: status || 'draft',
                tags: parsedTags,
                images: uploadedImages,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully.',
            data: blogPost,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Get all blog posts (admin view) with optional filters
 * Supports filtering by category, status, and tags
 */
const getAllBlogPosts = async (req, res, next) => {
    try {
        const { category, status, tag } = req.query;

        // Build filter conditions
        const where = {};

        if (category) {
            if (!['news', 'blog', 'article'].includes(category)) {
                throw new AppError('category must be "news", "blog", or "article"', 400, true);
            }
            where.category = category;
        }

        if (status) {
            if (!['draft', 'published'].includes(status)) {
                throw new AppError('status must be "draft" or "published"', 400, true);
            }
            where.status = status;
        }

        // Fetch all blog posts ordered by latest first
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

        res.status(200).json({
            success: true,
            data: blogPost,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Update blog post by ID (PATCH - partial update)
 * Can update title, content, category, status, tags, and/or images
 * If new images provided, old images are auto-deleted from Cloudinary
 */
const updateBlogPostById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, category, status, tags } = req.body;
        const files = req.files;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Check if blog post exists
        const existingBlogPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!existingBlogPost) {
            throw new AppError('Blog post not found', 404, true);
        }

        // Validate string fields if provided
        if (title && (typeof title !== 'string' || title.trim() === '')) {
            throw new AppError('title must be a non-empty string', 400, true);
        }

        if (content && (typeof content !== 'string' || content.trim() === '')) {
            throw new AppError('content must be a non-empty string', 400, true);
        }

        // Validate category if provided
        if (category && !['news', 'blog', 'article'].includes(category)) {
            throw new AppError('category must be "news", "blog", or "article"', 400, true);
        }

        // Validate status if provided
        if (status && !['draft', 'published'].includes(status)) {
            throw new AppError('status must be "draft" or "published"', 400, true);
        }

        // Validate tags if provided
        let parsedTags = null;
        if (tags) {
            if (!Array.isArray(tags)) {
                throw new AppError('tags must be an array of strings', 400, true);
            }
            parsedTags = tags.filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim());
        }

        // Handle image upload/replacement if new images provided
        let uploadedImages = null;
        if (files && files.length > 0) {
            uploadedImages = [];
            for (const file of files) {
                try {
                    const cloudinaryImage = await uploadImageToCloudinary(file.buffer, 'blog');
                    uploadedImages.push(cloudinaryImage);
                } catch (uploadError) {
                    // Cleanup already uploaded images if new upload fails
                    if (uploadedImages.length > 0) {
                        await deleteMultipleImagesFromCloudinary(
                            uploadedImages.map(img => img.public_id)
                        );
                    }
                    throw uploadError;
                }
            }

            // Delete old images from Cloudinary if new images provided
            if (existingBlogPost.images && Array.isArray(existingBlogPost.images)) {
                const oldPublicIds = existingBlogPost.images
                    .map(img => img.public_id)
                    .filter(id => id);
                if (oldPublicIds.length > 0) {
                    await deleteMultipleImagesFromCloudinary(oldPublicIds);
                }
            }
        }

        // Build update data (only include provided fields)
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (category !== undefined) updateData.category = category;
        if (status !== undefined) updateData.status = status;
        if (parsedTags !== null) updateData.tags = parsedTags;
        if (uploadedImages !== null) updateData.images = uploadedImages;

        // Update blog post
        const updatedBlogPost = await prisma.blogPost.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: 'Blog post updated successfully.',
            data: updatedBlogPost,
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

/**
 * Delete blog post by ID with Cloudinary image cleanup
 */
const deleteBlogPostById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            throw new AppError('ID is required', 400, true);
        }

        // Get blog post to extract image public_ids
        const blogPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!blogPost) {
            throw new AppError('Blog post not found', 404, true);
        }

        // Collect all Cloudinary public_ids for deletion
        const publicIds = [];
        if (blogPost.images && Array.isArray(blogPost.images)) {
            blogPost.images.forEach((image) => {
                if (image.public_id) {
                    publicIds.push(image.public_id);
                }
            });
        }

        // Delete images from Cloudinary
        if (publicIds.length > 0) {
            await deleteMultipleImagesFromCloudinary(publicIds);
        }

        // Delete blog post from database
        await prisma.blogPost.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully.',
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export {
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPostById,
    deleteBlogPostById,
};

// Public Statistics Controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

/**
 * Get public summary statistics
 * Includes counts for completed projects, approved members, event statuses, blog posts, and published leaders
 */
const getPublicSummary = async (req, res, next) => {
    try {
        // 1. Completed Projects count
        const completedProjectsCount = await prisma.project.count({
            where: { status: 'completed' },
        });

        // 2. Approved Members count
        const approvedMembersCount = await prisma.membership.count({
            where: { status: 'approved' },
        });

        // 3. Event Status counts (upcoming, live, past)
        const upcomingEventsCount = await prisma.event.count({
            where: { status: 'upcoming' },
        });

        const liveEventsCount = await prisma.event.count({
            where: { status: 'live' },
        });

        const pastEventsCount = await prisma.event.count({
            where: { status: 'past' },
        });

        // 4. Total BlogPosts (Articles) count
        const totalArticlesCount = await prisma.blogPost.count({
            where: { status: 'published' },
        });

        // 5. Published Leadership count
        const publishedLeadershipCount = await prisma.leadership.count({
            where: { status: 'published' },
        });

        res.status(200).json({
            success: true,
            data: {
                completedProjects: completedProjectsCount,
                approvedMembers: approvedMembersCount,
                events: {
                    upcoming: upcomingEventsCount,
                    live: liveEventsCount,
                    past: pastEventsCount,
                },
                totalArticles: totalArticlesCount,
                publishedLeaders: publishedLeadershipCount,
            },
        });
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getPublicSummary };

// Admin Statistics Controller
import { AppError } from '../../utils/error/AppError.js';
import { prisma } from '../../config/config.js';

// Get dashboard statistics
const getDashboardStatistics = async (req, res, next) => {
    try {
        // User Statistics
        const totalUsers = await prisma.user.count();
        const adminCount = await prisma.user.count({ where: { role: 'admin' } });
        const userCount = await prisma.user.count({ where: { role: 'user' } });

        // Singleton Pages Statistics
        const homeExists = await prisma.home.findFirst();
        const aboutExists = await prisma.about.findFirst();

        // Project Statistics
        const totalProjects = await prisma.project.count();
        const projectsByStatus = await prisma.project.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });

        // Blog Statistics
        const totalBlogPosts = await prisma.blogPost.count();
        const recentBlogPosts = await prisma.blogPost.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, createdAt: true },
        });

        // Gallery Statistics
        const totalGalleryEntries = await prisma.gallery.count();
        const galleryStats = await prisma.gallery.findMany({
            select: {
                id: true,
                title: true,
                images: true,
            },
        });
        const totalGalleryImages = galleryStats.reduce((sum, gallery) => sum + gallery.images.length, 0);

        // Testimonial Statistics
        const totalTestimonials = await prisma.testimonial.count();
        const recentTestimonials = await prisma.testimonial.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, role: true, createdAt: true },
        });

        // Contact Form Statistics
        const totalContacts = await prisma.contact.count();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentContacts = await prisma.contact.count({
            where: { date: { gte: thirtyDaysAgo } },
        });

        // FAQ Statistics
        const totalFAQs = await prisma.FAQ.count();

        // Journey Statistics
        const totalJourneyEvents = await prisma.journey.count();
        const journeyYears = await prisma.journey.findMany({
            select: { year: true },
            orderBy: { year: 'desc' },
        });

        // Announcement Statistics
        const totalAnnouncements = await prisma.announcement.count();
        const futureAnnouncements = await prisma.announcement.count({
            where: { start_date: { gt: new Date() } },
        });
        const recentAnnouncements = await prisma.announcement.findMany({
            take: 5,
            orderBy: { start_date: 'desc' },
            select: { id: true, title: true, start_date: true },
        });

        // Leadership Statistics
        const totalLeadership = await prisma.leadership.count();

        // Payment Statistics
        const totalPayments = await prisma.payment.count();
        const paymentsByStatus = await prisma.payment.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });
        const successfulPayments = await prisma.payment.findMany({
            where: { status: 'successful' },
            select: { amountWithFee: true },
        });
        const totalRevenue = successfulPayments.reduce((sum, payment) => sum + parseFloat(payment.amountWithFee), 0);
        const averagePaymentAmount = totalPayments > 0 
            ? successfulPayments.reduce((sum, payment) => sum + parseFloat(payment.amountWithFee), 0) / successfulPayments.length
            : 0;

        // Membership Statistics
        const totalMembers = await prisma.membership.count();
        const membersByStatus = await prisma.membership.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });
        const recentMembers = await prisma.membership.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, firstName: true, lastName: true, status: true, createdAt: true },
        });

        // Event Statistics
        const totalEvents = await prisma.event.count();
        const eventsByStatus = await prisma.event.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });
        const upcomingEvents = await prisma.event.count({
            where: { start_date: { gt: new Date() } },
        });

        // Refresh Token Statistics
        const totalRefreshTokens = await prisma.refreshToken.count();

        // Compile all statistics
        const statistics = {
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    admins: adminCount,
                    regularUsers: userCount,
                    userDistribution: {
                        admins: ((adminCount / totalUsers) * 100).toFixed(2) + '%',
                        users: ((userCount / totalUsers) * 100).toFixed(2) + '%',
                    },
                },
                pages: {
                    homeConfigured: !!homeExists,
                    aboutConfigured: !!aboutExists,
                },
                projects: {
                    total: totalProjects,
                    byStatus: projectsByStatus.reduce((acc, status) => {
                        acc[status.status] = status._count.id;
                        return acc;
                    }, {}),
                },
                blog: {
                    total: totalBlogPosts,
                    recentPosts: recentBlogPosts,
                },
                gallery: {
                    totalEntries: totalGalleryEntries,
                    totalImages: totalGalleryImages,
                    averageImagesPerEntry: totalGalleryEntries > 0 ? (totalGalleryImages / totalGalleryEntries).toFixed(2) : 0,
                },
                testimonials: {
                    total: totalTestimonials,
                    recentTestimonials: recentTestimonials,
                },
                contact: {
                    totalSubmissions: totalContacts,
                    last30Days: recentContacts,
                },
                faqs: {
                    total: totalFAQs,
                },
                journey: {
                    totalEvents: totalJourneyEvents,
                    yearsRepresented: journeyYears.map((j) => j.year),
                },
                announcements: {
                    total: totalAnnouncements,
                    scheduledForFuture: futureAnnouncements,
                    recentAnnouncements: recentAnnouncements,
                },
                leadership: {
                    total: totalLeadership,
                },
                payments: {
                    total: totalPayments,
                    byStatus: paymentsByStatus.reduce((acc, status) => {
                        acc[status.status] = status._count.id;
                        return acc;
                    }, {}),
                    totalRevenue: totalRevenue.toFixed(2),
                    averagePayment: averagePaymentAmount.toFixed(2),
                    successRate: totalPayments > 0 
                        ? ((paymentsByStatus.find((s) => s.status === 'successful')?._count.id || 0) / totalPayments * 100).toFixed(2) + '%'
                        : '0%',
                },
                tokens: {
                    activeRefreshTokens: totalRefreshTokens,
                },
                membership: {
                    total: totalMembers,
                    byStatus: membersByStatus.reduce((acc, status) => {
                        acc[status.status] = status._count.id;
                        return acc;
                    }, {}),
                    recentApplications: recentMembers,
                },
                events: {
                    total: totalEvents,
                    byStatus: eventsByStatus.reduce((acc, status) => {
                        acc[status.status] = status._count.id;
                        return acc;
                    }, {}),
                    upcomingCount: upcomingEvents,
                },
                summary: {
                    totalModels: 16,
                    totalRecords: totalUsers + totalProjects + totalBlogPosts + totalGalleryEntries + 
                                  totalTestimonials + totalContacts + totalFAQs + totalJourneyEvents + 
                                  totalAnnouncements + totalLeadership + totalPayments + totalMembers + totalEvents,
                },
            },
        };

        res.status(200).json(statistics);
    } catch (error) {
        next(new AppError(error.message, 500, true));
    }
};

export { getDashboardStatistics };

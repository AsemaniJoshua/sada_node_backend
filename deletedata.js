import { prisma } from './config/config.js';

async function clearData() {
    try {
        console.log('Starting to clear database...');

        // 1. Delete models that depend on User
        console.log('Deleting user-dependent data...');
        await prisma.pushSubscription.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.communicationLog.deleteMany();
        await prisma.userActivity.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.passwordReset.deleteMany();

        // 2. Delete models that depend on Membership
        console.log('Deleting membership-dependent data...');
        await prisma.payment.deleteMany();

        // 3. Delete Memberships
        console.log('Deleting memberships...');
        await prisma.membership.deleteMany();

        // 4. Delete independent models
        console.log('Deleting all other data...');
        const independentDeletes = [
            prisma.home.deleteMany(),
            prisma.hero.deleteMany(),
            prisma.about.deleteMany(),
            prisma.project.deleteMany(),
            prisma.blogPost.deleteMany(),
            prisma.gallery.deleteMany(),
            prisma.contact.deleteMany(),
            prisma.testimonial.deleteMany(),
            prisma.fAQ.deleteMany(),
            prisma.journey.deleteMany(),
            prisma.announcement.deleteMany(),
            prisma.leadership.deleteMany(),
            prisma.event.deleteMany()
        ];
        
        // Execute independent deletes concurrently
        await Promise.all(independentDeletes);

        // 5. Delete Users
        console.log('Deleting users...');
        await prisma.user.deleteMany();

        console.log('✅ Successfully cleared ALL data including users.');
    } catch (error) {
        console.error('❌ Error clearing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();

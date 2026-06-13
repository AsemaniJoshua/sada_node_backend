import { prisma } from './config/config.js';

async function testDatabase() {
    try {
        console.log('Testing Prisma Database Connection...');
        
        // Try to query the number of users
        const userCount = await prisma.user.count();
        
        console.log('✅ Connection Successful!');
        console.log(`✅ Current number of users in the database: ${userCount}`);
    } catch (error) {
        console.error('❌ Connection Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();

import fs from 'fs';
import { prisma } from './config/config.js';

async function seed() {
    try {
        console.log('Starting database seed...');
        
        // Prisma's executeRawUnsafe cannot execute multiple statements separated by semicolons
        // in one go safely without splitting them or executing a pure raw string.
        // Actually it's easier to just create the user via Prisma ORM directly.
        
        console.log('Seeding default admin user...');
        await prisma.user.create({
            data: {
                email: 'admin@sada.org',
                password: '$2b$10$.zKlQAOMNhvRCTt5ySe1fu61BbeOL6RVCeifL0xnIuWuJ4w7LB3KG',
                name: 'Admin',
                role: 'admin',
                isFirstTimeLogin: true
            }
        });

        console.log('Successfully seeded database. You can now login with admin@sada.org / 12345678');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

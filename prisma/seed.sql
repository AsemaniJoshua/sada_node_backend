-- SADA Backend Database Seed Script
-- Default Admin User Credentials
-- ================================
-- Email: admin@sada.org
-- Password: 12345678 (hashed with bcrypt)
--
-- INSTRUCTIONS:
-- 1. Ensure your database is created and empty
-- 2. Run Prisma migrations first: npx prisma migrate deploy
-- 3. Then run this seed file: mysql -u [user] -p [database] < prisma/seed.sql
-- 4. Login with admin@sada.org / 12345678

-- Insert default admin user
INSERT INTO `User` (
    `id`,
    `email`,
    `password`,
    `role`,
    `createdAt`,
    `updatedAt`
) VALUES (
    UUID(),
    'admin@sada.org',
    '$2b$10$.zKlQAOMNhvRCTt5ySe1fu61BbeOL6RVCeifL0xnIuWuJ4w7LB3KG',
    'admin',
    NOW(),
    NOW()
);

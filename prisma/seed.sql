-- SADA Backend Database Seed Script
-- Default Admin User Credentials
-- ================================
-- Email: admin@sada.org
-- Password: 12345678 (hashed with argon2id)
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
    '$argon2id$v=19$m=65536,t=3,p=4$gg4bCw/uod6Yw60ms1tc4A$qIhKiYZJvtZZ/cE8RwvCREfYNzNP1ka2R7rdR506LrU',
    'admin',
    NOW(),
    NOW()
);

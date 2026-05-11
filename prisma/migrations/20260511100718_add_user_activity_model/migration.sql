-- CreateTable
CREATE TABLE `UserActivity` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` ENUM('create', 'update', 'delete', 'approve', 'reject') NOT NULL,
    `logType` ENUM('Auth', 'Users', 'Blog', 'Gallery', 'Events', 'Projects', 'Membership', 'Payments', 'Hero', 'Announcements', 'FAQs', 'Journey', 'Leadership', 'Testimonials', 'Contact', 'Home', 'About') NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `description` LONGTEXT NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserActivity` ADD CONSTRAINT `UserActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

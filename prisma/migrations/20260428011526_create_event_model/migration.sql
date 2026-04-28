-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `event_banner` JSON NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'upcoming', 'live', 'past', 'cancelled') NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

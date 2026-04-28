/*
  Warnings:

  - You are about to drop the column `hero` on the `Home` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Home` DROP COLUMN `hero`;

-- CreateTable
CREATE TABLE `Hero` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `image` JSON NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `target_url` VARCHAR(191) NOT NULL,
    `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

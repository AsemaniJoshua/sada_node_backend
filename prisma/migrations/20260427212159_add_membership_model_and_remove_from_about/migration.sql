/*
  Warnings:

  - You are about to drop the column `membership` on the `About` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `About` DROP COLUMN `membership`;

-- CreateTable
CREATE TABLE `Membership` (
    `id` VARCHAR(191) NOT NULL,
    `benefits` JSON NOT NULL,
    `requirements` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

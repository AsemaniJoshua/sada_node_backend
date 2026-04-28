/*
  Warnings:

  - You are about to drop the column `position` on the `Leadership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Leadership` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Leadership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Leadership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_year` to the `Leadership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Leadership` DROP COLUMN `position`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `end_year` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL,
    ADD COLUMN `social_media` JSON NULL,
    ADD COLUMN `start_year` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft';

-- CreateIndex
CREATE UNIQUE INDEX `Leadership_email_key` ON `Leadership`(`email`);

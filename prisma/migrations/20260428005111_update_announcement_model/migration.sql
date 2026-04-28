/*
  Warnings:

  - You are about to drop the column `date` on the `Announcement` table. All the data in the column will be lost.
  - Added the required column `expiry_date` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Announcement` DROP COLUMN `date`,
    ADD COLUMN `expiry_date` DATETIME(3) NOT NULL,
    ADD COLUMN `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
    ADD COLUMN `start_date` DATETIME(3) NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft';

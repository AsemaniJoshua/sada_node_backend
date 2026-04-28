/*
  Warnings:

  - You are about to drop the column `event` on the `Journey` table. All the data in the column will be lost.
  - Added the required column `category` to the `Journey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Journey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Journey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratings` to the `Testimonial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Journey` DROP COLUMN `event`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` LONGTEXT NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft',
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Testimonial` ADD COLUMN `ratings` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft';

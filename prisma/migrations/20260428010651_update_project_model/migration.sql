/*
  Warnings:

  - You are about to alter the column `status` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(3))`.
  - Added the required column `budget` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progress` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` ADD COLUMN `budget` DOUBLE NOT NULL,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `end_date` DATETIME(3) NULL,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `progress` INTEGER NOT NULL,
    ADD COLUMN `start_date` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('planned', 'in_progress', 'paused', 'completed', 'cancelled') NOT NULL DEFAULT 'planned';

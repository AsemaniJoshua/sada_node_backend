/*
  Warnings:

  - Added the required column `category` to the `Gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_date` to the `Gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_image` to the `Gallery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Gallery` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` LONGTEXT NOT NULL,
    ADD COLUMN `event_date` DATETIME(3) NOT NULL,
    ADD COLUMN `primary_image` JSON NOT NULL;

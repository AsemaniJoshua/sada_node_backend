/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Membership` ADD COLUMN `memberId` VARCHAR(191) NOT NULL DEFAULT 'TEMP';

-- CreateIndex
CREATE UNIQUE INDEX `Membership_memberId_key` ON `Membership`(`memberId`);

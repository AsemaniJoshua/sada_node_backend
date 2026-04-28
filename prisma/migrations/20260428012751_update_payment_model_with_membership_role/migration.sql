/*
  Warnings:

  - You are about to drop the column `date` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `email` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membership_role` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month_paid_for` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_paid_for` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `date`,
    DROP COLUMN `purpose`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `full_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `membership_role` ENUM('standard', 'executive', 'voluntary') NOT NULL,
    ADD COLUMN `month_paid_for` INTEGER NOT NULL,
    ADD COLUMN `payment_method` VARCHAR(191) NULL,
    ADD COLUMN `year_paid_for` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Membership`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

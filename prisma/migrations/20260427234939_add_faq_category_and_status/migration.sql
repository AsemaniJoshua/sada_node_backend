/*
  Warnings:

  - You are about to drop the column `benefits` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `FAQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentAddress` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContact` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyName` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyOccupation` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyRelationship` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ethnicity` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherContact` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherHometown` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hometown` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherContact` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherHometown` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeOfBirth` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suburb` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FAQ` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `Membership` DROP COLUMN `benefits`,
    DROP COLUMN `requirements`,
    ADD COLUMN `age` INTEGER NOT NULL,
    ADD COLUMN `currentAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `declaration` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `dob` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `emergencyContact` VARCHAR(191) NOT NULL,
    ADD COLUMN `emergencyName` VARCHAR(191) NOT NULL,
    ADD COLUMN `emergencyOccupation` VARCHAR(191) NOT NULL,
    ADD COLUMN `emergencyRelationship` VARCHAR(191) NOT NULL,
    ADD COLUMN `ethnicity` VARCHAR(191) NOT NULL,
    ADD COLUMN `fatherContact` VARCHAR(191) NOT NULL,
    ADD COLUMN `fatherHometown` VARCHAR(191) NOT NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL,
    ADD COLUMN `hometown` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `motherContact` VARCHAR(191) NOT NULL,
    ADD COLUMN `motherHometown` VARCHAR(191) NOT NULL,
    ADD COLUMN `motherName` VARCHAR(191) NOT NULL,
    ADD COLUMN `notes` LONGTEXT NULL,
    ADD COLUMN `occupation` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `placeOfBirth` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    ADD COLUMN `suburb` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Membership_phone_key` ON `Membership`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `Membership_email_key` ON `Membership`(`email`);

/*
  Warnings:

  - You are about to drop the column `author` on the `BlogPost` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `BlogPost` table. All the data in the column will be lost.
  - Added the required column `category` to the `BlogPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `BlogPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BlogPost` DROP COLUMN `author`,
    DROP COLUMN `date`,
    ADD COLUMN `category` ENUM('news', 'blog', 'article') NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft') NOT NULL DEFAULT 'draft',
    ADD COLUMN `tags` JSON NOT NULL;

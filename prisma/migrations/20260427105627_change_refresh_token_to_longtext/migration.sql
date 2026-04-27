-- DropIndex
DROP INDEX `RefreshToken_token_key` ON `RefreshToken`;

-- AlterTable
ALTER TABLE `RefreshToken` MODIFY `token` LONGTEXT NOT NULL;

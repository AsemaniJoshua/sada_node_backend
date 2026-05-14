-- CreateTable
CREATE TABLE `CommunicationLog` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('email', 'sms') NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `recipientCount` INTEGER NOT NULL,
    `subject` VARCHAR(191) NULL,
    `message` LONGTEXT NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CommunicationLog` ADD CONSTRAINT `CommunicationLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

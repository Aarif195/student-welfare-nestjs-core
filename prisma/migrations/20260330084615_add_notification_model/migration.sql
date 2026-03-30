/*
  Warnings:

  - The values [PDF] on the enum `RoomResource_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [PDF] on the enum `RoomResource_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `hostel_resources` MODIFY `file_type` ENUM('IMAGE', 'VIDEO') NOT NULL;

-- AlterTable
ALTER TABLE `roomresource` MODIFY `type` ENUM('IMAGE', 'VIDEO') NOT NULL;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `hostel_id` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `creator_role` ENUM('student', 'hostelOwner', 'superadmin') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_hostel_id_fkey` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `hostel_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `hostel_images` DROP FOREIGN KEY `hostel_images_hostel_id_fkey`;

-- DropTable
DROP TABLE `hostel_images`;

-- CreateTable
CREATE TABLE `hostel_resources` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostel_id` INTEGER NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_type` ENUM('IMAGE', 'VIDEO', 'PDF') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hostel_resources` ADD CONSTRAINT `hostel_resources_hostel_id_fkey` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `hostel_resources` ADD COLUMN `maintenance_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `MaintenanceRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `hostel_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'in_progress', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    `image_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `hostel_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `owner_reply` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `replied_at` DATETIME(3) NULL,

    UNIQUE INDEX `Review_student_id_hostel_id_key`(`student_id`, `hostel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudySpace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `total_capacity` INTEGER NOT NULL,
    `available_slots` INTEGER NOT NULL,
    `status` ENUM('open', 'closed', 'full') NOT NULL DEFAULT 'open',
    `opening_time` VARCHAR(191) NOT NULL,
    `closing_time` VARCHAR(191) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `bookings_student_id_key` ON `bookings`(`student_id`);

-- AddForeignKey
ALTER TABLE `hostel_resources` ADD CONSTRAINT `hostel_resources_maintenance_id_fkey` FOREIGN KEY (`maintenance_id`) REFERENCES `MaintenanceRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_hostel_id_fkey` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_hostel_id_fkey` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudySpace` ADD CONSTRAINT `StudySpace_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

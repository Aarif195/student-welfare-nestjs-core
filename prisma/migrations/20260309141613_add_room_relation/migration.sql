-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostel_id` INTEGER NOT NULL,
    `room_number` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `availability` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Room_hostel_id_room_number_key`(`hostel_id`, `room_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomResource` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO', 'PDF') NOT NULL,
    `room_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_hostel_id_fkey` FOREIGN KEY (`hostel_id`) REFERENCES `hostels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomResource` ADD CONSTRAINT `RoomResource_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

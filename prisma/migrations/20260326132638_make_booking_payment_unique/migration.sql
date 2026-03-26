/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `payments_booking_id_key` ON `payments`(`booking_id`);

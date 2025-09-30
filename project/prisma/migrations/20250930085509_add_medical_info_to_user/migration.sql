/*
  Warnings:

  - You are about to drop the column `notes` on the `emergency_requests` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `emergency_requests` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `emergency_requests` table. All the data in the column will be lost.
  - You are about to drop the column `availableIcuBeds` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `available_beds` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `icuBeds` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `medicalInfo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `totalBeds` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `medicalInfo` on the `users` table. All the data in the column will be lost.
  - Changed the type of `status` on the `emergency_requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "emergency_project"."emergency_requests" DROP COLUMN "notes",
DROP COLUMN "type",
DROP COLUMN "updatedBy",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "emergency_project"."notifications" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "emergency_project"."organizations" DROP COLUMN "availableIcuBeds",
DROP COLUMN "available_beds",
DROP COLUMN "icuBeds",
DROP COLUMN "medicalInfo",
DROP COLUMN "totalBeds",
ADD COLUMN     "availableBeds" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "emergency_project"."users" DROP COLUMN "medicalInfo";

-- DropEnum
DROP TYPE "emergency_project"."EmergencyStatus";

-- DropEnum
DROP TYPE "emergency_project"."EmergencyType";

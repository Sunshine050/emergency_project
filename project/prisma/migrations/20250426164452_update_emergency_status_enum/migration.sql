/*
  Warnings:

  - The `status` column on the `emergency_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "emergency_project"."EmergencyStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "emergency_project"."emergency_requests" DROP COLUMN "status",
ADD COLUMN     "status" "emergency_project"."EmergencyStatus" NOT NULL DEFAULT 'PENDING';

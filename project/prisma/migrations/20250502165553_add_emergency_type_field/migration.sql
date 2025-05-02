-- CreateEnum
CREATE TYPE "emergency_project"."EmergencyType" AS ENUM ('ACCIDENT', 'MEDICAL', 'FIRE', 'CRIME', 'OTHER');

-- AlterTable
ALTER TABLE "emergency_project"."emergency_requests" ADD COLUMN     "type" "emergency_project"."EmergencyType" NOT NULL DEFAULT 'OTHER';

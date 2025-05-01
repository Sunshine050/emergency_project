/*
  Warnings:

  - The `location` column on the `emergency_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `dispatchTime` on the `emergency_responses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "emergency_project"."emergency_requests" ADD COLUMN     "emergencyType" TEXT,
ADD COLUMN     "severity" INTEGER,
ADD COLUMN     "symptoms" TEXT[],
ADD COLUMN     "title" TEXT,
DROP COLUMN "location",
ADD COLUMN     "location" JSONB;

-- AlterTable
ALTER TABLE "emergency_project"."emergency_responses" DROP COLUMN "dispatchTime",
ADD COLUMN     "assignedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "emergency_project"."notifications" ADD COLUMN     "emergencyRequestId" TEXT;

-- AddForeignKey
ALTER TABLE "emergency_project"."notifications" ADD CONSTRAINT "notifications_emergencyRequestId_fkey" FOREIGN KEY ("emergencyRequestId") REFERENCES "emergency_project"."emergency_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

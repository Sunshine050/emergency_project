-- AlterTable
ALTER TABLE "emergency_project"."organizations" ADD COLUMN     "availableIcuBeds" INTEGER DEFAULT 0,
ADD COLUMN     "icuBeds" INTEGER DEFAULT 0,
ADD COLUMN     "totalBeds" INTEGER DEFAULT 0;

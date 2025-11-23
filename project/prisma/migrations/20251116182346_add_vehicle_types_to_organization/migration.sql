-- AlterTable
ALTER TABLE "emergency_project"."organizations" ADD COLUMN     "vehicleTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

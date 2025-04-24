-- AlterTable
ALTER TABLE "emergency_project"."users" ADD COLUMN     "password" TEXT,
ALTER COLUMN "supabaseUserId" DROP NOT NULL;

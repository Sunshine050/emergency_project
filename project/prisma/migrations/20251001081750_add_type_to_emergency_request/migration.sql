/*
  Warnings:

  - Added the required column `type` to the `emergency_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emergency_project"."emergency_requests" ADD COLUMN     "type" TEXT NOT NULL;

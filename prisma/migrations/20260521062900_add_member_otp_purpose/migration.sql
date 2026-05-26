/*
  Warnings:

  - Added the required column `purpose` to the `member_otp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberOTPPurpose" AS ENUM ('LOGIN', 'VERIFY_PHONE', 'VERIFY_EMAIL');

-- AlterTable
ALTER TABLE "member_otp" ADD COLUMN     "purpose" "MemberOTPPurpose" NOT NULL;

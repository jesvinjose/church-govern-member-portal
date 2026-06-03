/*
  Warnings:

  - You are about to drop the column `notes` on the `familys` table. All the data in the column will be lost.
  - You are about to drop the column `relation` on the `members` table. All the data in the column will be lost.
  - You are about to drop the `announcements` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('CREATED', 'INCOMEING', 'INCOMING', 'OUTGOING', 'TRANSFERED', 'INTERNAL_SPLIT', 'EXTERNAL_SPLIT');

-- CreateEnum
CREATE TYPE "BroadcastType" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'CANCELLED', 'SCHEDULED');

-- DropForeignKey
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "familys" DROP CONSTRAINT "familys_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_tenant_id_fkey";

-- DropIndex
DROP INDEX "roles_tenant_id_name_key";

-- AlterTable
ALTER TABLE "familys" DROP COLUMN "notes",
ADD COLUMN     "classification_id" TEXT,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "family_image" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "house_image" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "parish_family_id" TEXT,
ADD COLUMN     "prayer_group_id" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "taluk" TEXT,
ADD COLUMN     "type" "FamilyType",
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "village" TEXT,
ADD COLUMN     "ward_id" TEXT,
ALTER COLUMN "tenant_id" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "relation",
ADD COLUMN     "available_home" TEXT,
ADD COLUMN     "blood_group" TEXT,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "display_register" TEXT,
ADD COLUMN     "education_qualification" TEXT,
ADD COLUMN     "father_id" TEXT,
ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "husband_id" TEXT,
ADD COLUMN     "is_deceased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_migration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mother_id" TEXT,
ADD COLUMN     "mother_name" TEXT,
ADD COLUMN     "nri" TEXT,
ADD COLUMN     "parish_name" TEXT,
ADD COLUMN     "prayer_group_id" TEXT,
ADD COLUMN     "prayer_group_name" TEXT,
ADD COLUMN     "relation_id" TEXT,
ADD COLUMN     "spouse_name" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "ward_id" TEXT,
ADD COLUMN     "ward_name" TEXT,
ALTER COLUMN "tenant_id" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "requests" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "address_line1" TEXT,
ADD COLUMN     "address_line2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "diocese_id" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "no_graves" INTEGER,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "mfa_enable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_by" TEXT,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- DropTable
DROP TABLE "announcements";

-- CreateTable
CREATE TABLE "diocese" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "diocese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_id" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_id" TEXT,
    "ward_id" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "prayer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_id" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_id" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcasts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "type" "BroadcastType" NOT NULL DEFAULT 'SMS',
    "title" TEXT,
    "content" TEXT,
    "category" "AnnouncementCategory",
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3),
    "time" TEXT,
    "ward_id" TEXT,
    "target_audience" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "delivery_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "is_delivery" BOOLEAN NOT NULL DEFAULT false,
    "is_immediately" BOOLEAN NOT NULL DEFAULT false,
    "status" "BroadcastStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wards_tenant_id_idx" ON "wards"("tenant_id");

-- CreateIndex
CREATE INDEX "prayer_groups_tenant_id_idx" ON "prayer_groups"("tenant_id");

-- CreateIndex
CREATE INDEX "prayer_groups_ward_id_idx" ON "prayer_groups"("ward_id");

-- CreateIndex
CREATE INDEX "classifications_tenant_id_idx" ON "classifications"("tenant_id");

-- CreateIndex
CREATE INDEX "relation_tenant_id_idx" ON "relation"("tenant_id");

-- CreateIndex
CREATE INDEX "broadcasts_tenant_id_idx" ON "broadcasts"("tenant_id");

-- CreateIndex
CREATE INDEX "broadcasts_type_idx" ON "broadcasts"("type");

-- CreateIndex
CREATE INDEX "broadcasts_category_idx" ON "broadcasts"("category");

-- CreateIndex
CREATE INDEX "familys_ward_id_idx" ON "familys"("ward_id");

-- CreateIndex
CREATE INDEX "familys_prayer_group_id_idx" ON "familys"("prayer_group_id");

-- CreateIndex
CREATE INDEX "familys_classification_id_idx" ON "familys"("classification_id");

-- CreateIndex
CREATE INDEX "members_relation_id_idx" ON "members"("relation_id");

-- CreateIndex
CREATE INDEX "members_ward_id_idx" ON "members"("ward_id");

-- CreateIndex
CREATE INDEX "members_prayer_group_id_idx" ON "members"("prayer_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_diocese_id_fkey" FOREIGN KEY ("diocese_id") REFERENCES "diocese"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familys" ADD CONSTRAINT "familys_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "classifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familys" ADD CONSTRAINT "familys_prayer_group_id_fkey" FOREIGN KEY ("prayer_group_id") REFERENCES "prayer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familys" ADD CONSTRAINT "familys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familys" ADD CONSTRAINT "familys_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_prayer_group_id_fkey" FOREIGN KEY ("prayer_group_id") REFERENCES "prayer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_relation_id_fkey" FOREIGN KEY ("relation_id") REFERENCES "relation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_groups" ADD CONSTRAINT "prayer_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_groups" ADD CONSTRAINT "prayer_groups_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relation" ADD CONSTRAINT "relation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

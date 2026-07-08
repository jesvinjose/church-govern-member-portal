-- DropIndex
DROP INDEX "familys_classification_id_idx";

-- DropIndex
DROP INDEX "familys_prayer_group_id_idx";

-- DropIndex
DROP INDEX "familys_tenant_id_idx";

-- DropIndex
DROP INDEX "familys_ward_id_idx";

-- AlterTable
ALTER TABLE "familys" ADD COLUMN     "is_bulk_uploaded" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subscription" INTEGER;

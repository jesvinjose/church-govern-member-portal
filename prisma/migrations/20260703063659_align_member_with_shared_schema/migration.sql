-- DropIndex
DROP INDEX "members_family_id_idx";

-- DropIndex
DROP INDEX "members_prayer_group_id_idx";

-- DropIndex
DROP INDEX "members_relation_id_idx";

-- DropIndex
DROP INDEX "members_tenant_id_idx";

-- DropIndex
DROP INDEX "members_ward_id_idx";

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "is_divorced" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_husband_id_fkey" FOREIGN KEY ("husband_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

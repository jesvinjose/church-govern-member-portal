-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('DONATION', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'UPI', 'CARD', 'CHEQUE');

-- CreateEnum
CREATE TYPE "ContributionPrivacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "receipt_no" TEXT,
    "type" "ContributionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "purpose" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "privacy" "ContributionPrivacy" NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contributions_receipt_no_key" ON "contributions"("receipt_no");

-- CreateIndex
CREATE INDEX "contributions_tenant_id_idx" ON "contributions"("tenant_id");

-- CreateIndex
CREATE INDEX "contributions_member_id_idx" ON "contributions"("member_id");

-- CreateIndex
CREATE INDEX "contributions_family_id_idx" ON "contributions"("family_id");

-- CreateIndex
CREATE INDEX "contributions_status_idx" ON "contributions"("status");

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "familys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

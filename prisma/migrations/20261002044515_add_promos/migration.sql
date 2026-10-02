-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT;

-- CreateTable
CREATE TABLE "Promo" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT NOT NULL DEFAULT 'Deal',
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscount" DOUBLE PRECISION,
    "minSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "restaurantId" INTEGER,
    "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promo_code_key" ON "Promo"("code");

-- CreateIndex
CREATE INDEX "Promo_active_idx" ON "Promo"("active");

/*
  Warnings:

  - You are about to drop the column `product_ids` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `payment_transactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `product_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "product_ids",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- DropTable
DROP TABLE "payment_transactions";

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "payment_system" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "opened_payment_data" JSONB NOT NULL,
    "confirmed_payment_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

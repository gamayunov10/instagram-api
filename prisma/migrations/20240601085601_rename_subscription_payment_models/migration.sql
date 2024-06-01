/*
  Warnings:

  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "payment_transaction";

-- CreateTable
CREATE TABLE "subscription_order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "payment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_payment_transaction" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "payment_system" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "opened_payment_data" JSONB NOT NULL,
    "confirmed_payment_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payment_transaction_pkey" PRIMARY KEY ("id")
);

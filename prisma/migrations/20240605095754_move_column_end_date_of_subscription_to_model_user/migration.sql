/*
  Warnings:

  - You are about to drop the column `end_date_of_subscription` on the `subscription_payment_transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "subscription_payment_transaction" DROP COLUMN "end_date_of_subscription";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "end_date_of_subscription" TIMESTAMP(3);

/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `subscription_order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscription_order_payment_id_key" ON "subscription_order"("payment_id");

-- AddForeignKey
ALTER TABLE "subscription_order" ADD CONSTRAINT "subscription_order_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "subscription_payment_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

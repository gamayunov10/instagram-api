-- AddForeignKey
ALTER TABLE "subscription_order" ADD CONSTRAINT "subscription_order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

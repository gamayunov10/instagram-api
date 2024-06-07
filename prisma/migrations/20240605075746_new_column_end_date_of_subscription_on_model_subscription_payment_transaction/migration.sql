-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "subscription_payment_transaction" ADD COLUMN     "end_date_of_subscription" TIMESTAMP(3);

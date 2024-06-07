-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "subscription_order" ADD COLUMN     "subscription_time" TEXT;

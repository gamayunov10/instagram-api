-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "account_type" TEXT NOT NULL DEFAULT 'Personal';

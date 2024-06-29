-- AlterTable
ALTER TABLE "confirmation_code" ALTER COLUMN "expiration_date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "password_recovery_code" ADD COLUMN     "expiration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP + interval '10 minutes';

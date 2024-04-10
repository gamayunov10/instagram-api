/*
  Warnings:

  - You are about to drop the column `user_id` on the `user_provider_info` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_provider_info" DROP CONSTRAINT "user_provider_info_user_id_fkey";

-- DropIndex
DROP INDEX "user_provider_info_user_id_key";

-- DropIndex
DROP INDEX "user_provider_info_user_id_provider_key";

-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "user_provider_info" DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "user_provider_info" ADD CONSTRAINT "user_provider_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

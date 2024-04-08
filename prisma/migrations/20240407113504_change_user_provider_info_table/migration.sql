/*
  Warnings:

  - You are about to drop the column `name` on the `user_provider_info` table. All the data in the column will be lost.
  - You are about to drop the column `provider_user_id` on the `user_provider_info` table. All the data in the column will be lost.
  - Added the required column `user_provider_id` to the `user_provider_info` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `provider` on the `user_provider_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "user_provider_info" DROP COLUMN "name",
DROP COLUMN "provider_user_id",
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "user_provider_id" TEXT NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Provider";

-- CreateIndex
CREATE UNIQUE INDEX "user_provider_info_user_id_provider_key" ON "user_provider_info"("user_id", "provider");

/*
  Warnings:

  - The primary key for the `user_provider_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_provider_info` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username,email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - The required column `user_provider_info_id` was added to the `user_provider_info` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "user_provider_info" DROP CONSTRAINT "user_provider_info_pkey",
DROP COLUMN "id",
ADD COLUMN     "user_provider_info_id" TEXT NOT NULL,
ADD CONSTRAINT "user_provider_info_pkey" PRIMARY KEY ("user_provider_info_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_email_key" ON "user"("username", "email");

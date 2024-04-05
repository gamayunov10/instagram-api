/*
  Warnings:

  - You are about to drop the column `user)id` on the `password_recovery_code` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `password_recovery_code` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `password_recovery_code` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "password_recovery_code" DROP CONSTRAINT "password_recovery_code_user)id_fkey";

-- DropIndex
DROP INDEX "password_recovery_code_user)id_key";

-- AlterTable
ALTER TABLE "password_recovery_code" DROP COLUMN "user)id",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '10 minutes';

-- CreateIndex
CREATE UNIQUE INDEX "password_recovery_code_user_id_key" ON "password_recovery_code"("user_id");

-- AddForeignKey
ALTER TABLE "password_recovery_code" ADD CONSTRAINT "password_recovery_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

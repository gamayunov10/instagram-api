/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "birth_date" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstname" TEXT,
ADD COLUMN     "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastname" TEXT,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ConfirmationCode" (
    "confirmation_code_id" TEXT NOT NULL,
    "confirmation_code" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ConfirmationCode_pkey" PRIMARY KEY ("confirmation_code_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationCode_confirmation_code_key" ON "ConfirmationCode"("confirmation_code");

-- AddForeignKey
ALTER TABLE "ConfirmationCode" ADD CONSTRAINT "ConfirmationCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

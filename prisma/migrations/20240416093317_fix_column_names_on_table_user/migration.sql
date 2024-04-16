/*
  Warnings:

  - You are about to drop the column `firstname` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "firstname",
DROP COLUMN "lastname",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

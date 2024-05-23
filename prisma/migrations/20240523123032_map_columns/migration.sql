/*
  Warnings:

  - You are about to drop the column `authorId` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_provider_info` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "user_provider_info" DROP CONSTRAINT "user_provider_info_userId_fkey";

-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- AlterTable
ALTER TABLE "post" DROP COLUMN "authorId",
DROP COLUMN "deletedAt",
ADD COLUMN     "author_id" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;

-- AlterTable
ALTER TABLE "user_provider_info" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "user_provider_info" ADD CONSTRAINT "user_provider_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

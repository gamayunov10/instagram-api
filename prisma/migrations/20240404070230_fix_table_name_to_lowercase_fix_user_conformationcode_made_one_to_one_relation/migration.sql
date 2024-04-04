/*
  Warnings:

  - You are about to drop the `ConfirmationCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConfirmationCode" DROP CONSTRAINT "ConfirmationCode_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "ConfirmationCode";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "birth_date" TEXT,
    "city" TEXT,
    "about_me" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmation_code" (
    "confirmation_code_id" TEXT NOT NULL,
    "confirmation_code" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "confirmation_code_pkey" PRIMARY KEY ("confirmation_code_id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN DEFAULT false,
    "authorId" TEXT,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_code_confirmation_code_key" ON "confirmation_code"("confirmation_code");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_code_user_id_key" ON "confirmation_code"("user_id");

-- AddForeignKey
ALTER TABLE "confirmation_code" ADD CONSTRAINT "confirmation_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

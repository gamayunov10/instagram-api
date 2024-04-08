-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'GITHUB');

-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- CreateTable
CREATE TABLE "user_provider_info" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,

    CONSTRAINT "user_provider_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_provider_info_user_id_key" ON "user_provider_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_provider_info_user_id_provider_key" ON "user_provider_info"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "user_provider_info" ADD CONSTRAINT "user_provider_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "user_ban_info" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ban_reason" TEXT NOT NULL,
    "banned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unbanned_at" TIMESTAMP(3),
    "banned_by" TEXT,

    CONSTRAINT "user_ban_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_ban_info_user_id_key" ON "user_ban_info"("user_id");

-- AddForeignKey
ALTER TABLE "user_ban_info" ADD CONSTRAINT "user_ban_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "password_recovery_code" (
    "password_recovery_code_id" TEXT NOT NULL,
    "recovery_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user)id" TEXT NOT NULL,

    CONSTRAINT "password_recovery_code_pkey" PRIMARY KEY ("password_recovery_code_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_recovery_code_recovery_code_key" ON "password_recovery_code"("recovery_code");

-- CreateIndex
CREATE UNIQUE INDEX "password_recovery_code_user)id_key" ON "password_recovery_code"("user)id");

-- AddForeignKey
ALTER TABLE "password_recovery_code" ADD CONSTRAINT "password_recovery_code_user)id_fkey" FOREIGN KEY ("user)id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

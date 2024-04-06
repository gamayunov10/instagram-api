-- AlterTable
ALTER TABLE "password_recovery_code" ALTER COLUMN "expiration_date" SET DEFAULT CURRENT_TIMESTAMP + interval '4 hours';

-- CreateTable
CREATE TABLE "device_auth_session" (
    "device_auth_session_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "last_active_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "device_auth_session_pkey" PRIMARY KEY ("device_auth_session_id")
);

-- AddForeignKey
ALTER TABLE "device_auth_session" ADD CONSTRAINT "device_auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

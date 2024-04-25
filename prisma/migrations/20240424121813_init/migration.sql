-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "birth_date" TEXT,
    "city" TEXT,
    "about_me" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "avatar_id" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_provider_info" (
    "user_provider_info_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "user_provider_id" TEXT NOT NULL,
    "display_name" TEXT,
    "email" TEXT,
    "city" TEXT,
    "userId" TEXT,

    CONSTRAINT "user_provider_info_pkey" PRIMARY KEY ("user_provider_info_id")
);

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

-- CreateTable
CREATE TABLE "confirmation_code" (
    "confirmation_code_id" TEXT NOT NULL,
    "confirmation_code" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "confirmation_code_pkey" PRIMARY KEY ("confirmation_code_id")
);

-- CreateTable
CREATE TABLE "password_recovery_code" (
    "password_recovery_code_id" TEXT NOT NULL,
    "recovery_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP + interval '4 hours',
    "user_id" TEXT NOT NULL,

    CONSTRAINT "password_recovery_code_pkey" PRIMARY KEY ("password_recovery_code_id")
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
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_email_key" ON "user"("username", "email");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_code_confirmation_code_key" ON "confirmation_code"("confirmation_code");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_code_user_id_key" ON "confirmation_code"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_recovery_code_recovery_code_key" ON "password_recovery_code"("recovery_code");

-- CreateIndex
CREATE UNIQUE INDEX "password_recovery_code_user_id_key" ON "password_recovery_code"("user_id");

-- AddForeignKey
ALTER TABLE "user_provider_info" ADD CONSTRAINT "user_provider_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_auth_session" ADD CONSTRAINT "device_auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_code" ADD CONSTRAINT "confirmation_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_recovery_code" ADD CONSTRAINT "password_recovery_code_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

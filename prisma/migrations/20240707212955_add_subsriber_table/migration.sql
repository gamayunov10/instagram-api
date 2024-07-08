-- CreateTable
CREATE TABLE "subscriber" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "payment_system" TEXT NOT NULL,

    CONSTRAINT "subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_customer_id_subscription_id_key" ON "subscriber"("customer_id", "subscription_id");

/*
  Warnings:

  - A unique constraint covering the columns `[midtrans_order_id]` on the table `Pembayaran` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pembayaran" ADD COLUMN     "midtrans_order_id" TEXT,
ADD COLUMN     "payment_link" TEXT;

-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "quantity" INTEGER;

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "pembayaran_id" INTEGER,
    "payment_type" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_pembayaran_id_key" ON "payments"("pembayaran_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_midtrans_order_id_key" ON "Pembayaran"("midtrans_order_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pembayaran_id_fkey" FOREIGN KEY ("pembayaran_id") REFERENCES "Pembayaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

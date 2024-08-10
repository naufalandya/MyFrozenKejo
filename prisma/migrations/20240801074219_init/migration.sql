/*
  Warnings:

  - A unique constraint covering the columns `[pembayaran_id]` on the table `Transaksi` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "pembayaran_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_pembayaran_id_key" ON "Transaksi"("pembayaran_id");

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_pembayaran_id_fkey" FOREIGN KEY ("pembayaran_id") REFERENCES "Pembayaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

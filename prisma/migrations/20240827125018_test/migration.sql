/*
  Warnings:

  - You are about to drop the column `description` on the `Produk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produk" DROP COLUMN "description",
ADD COLUMN     "deskripsi" TEXT DEFAULT '';

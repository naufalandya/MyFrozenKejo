/*
  Warnings:

  - Added the required column `nama` to the `Produk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Produk" ADD COLUMN     "merk" TEXT,
ADD COLUMN     "nama" TEXT NOT NULL,
ALTER COLUMN "foto" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

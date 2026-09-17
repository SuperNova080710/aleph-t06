/*
  Warnings:

  - Added the required column `userId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

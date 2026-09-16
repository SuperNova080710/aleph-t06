/*
  Warnings:

  - Added the required column `userId` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "plans_userId_idx" ON "plans"("userId");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

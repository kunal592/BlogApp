-- CreateEnum
CREATE TYPE "MediaPurpose" AS ENUM ('AVATAR', 'COVER', 'INLINE', 'GENERAL');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "blogId" TEXT,
ADD COLUMN     "purpose" "MediaPurpose" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "media_blogId_idx" ON "media"("blogId");

-- CreateIndex
CREATE INDEX "media_purpose_idx" ON "media"("purpose");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "community_notes" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "quote" TEXT,
    "status" "NoteStatus" NOT NULL DEFAULT 'PENDING',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_notes_blogId_idx" ON "community_notes"("blogId");

-- CreateIndex
CREATE INDEX "community_notes_status_idx" ON "community_notes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "note_votes_userId_noteId_key" ON "note_votes"("userId", "noteId");

-- AddForeignKey
ALTER TABLE "community_notes" ADD CONSTRAINT "community_notes_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_notes" ADD CONSTRAINT "community_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_votes" ADD CONSTRAINT "note_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_votes" ADD CONSTRAINT "note_votes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "community_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT
);

-- CreateTable
CREATE TABLE "Label" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    CONSTRAINT "Label_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

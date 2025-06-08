/*
  Warnings:

  - You are about to drop the column `joinText` on the `KUser` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speaker" INTEGER NOT NULL DEFAULT 0,
    "isRead" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_KUser" ("id", "isRead", "speaker") SELECT "id", "isRead", "speaker" FROM "KUser";
DROP TABLE "KUser";
ALTER TABLE "new_KUser" RENAME TO "KUser";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

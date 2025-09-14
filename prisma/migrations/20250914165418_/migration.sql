-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "yomi" TEXT NOT NULL,
    "kUserId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "KWord_kUserId_fkey" FOREIGN KEY ("kUserId") REFERENCES "KUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KWord_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "KGuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KWord" ("guildId", "id", "kUserId", "word", "yomi") SELECT "guildId", "id", "kUserId", "word", "yomi" FROM "KWord";
DROP TABLE "KWord";
ALTER TABLE "new_KWord" RENAME TO "KWord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

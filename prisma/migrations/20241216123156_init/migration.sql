-- CreateTable
CREATE TABLE "KUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speaker" INTEGER NOT NULL DEFAULT 0,
    "isRead" BOOLEAN NOT NULL DEFAULT true,
    "joinText" TEXT NOT NULL DEFAULT 'よお{name}'
);

-- CreateTable
CREATE TABLE "KGuild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maxChar" INTEGER NOT NULL DEFAULT 25,
    "speaker" INTEGER NOT NULL DEFAULT 0,
    "speed" REAL NOT NULL DEFAULT 1,
    "readName" BOOLEAN NOT NULL DEFAULT false,
    "vcReadName" BOOLEAN NOT NULL DEFAULT true,
    "joinText" TEXT NOT NULL DEFAULT 'よお{name}'
);

-- CreateTable
CREATE TABLE "KWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "yomi" TEXT NOT NULL,
    "kUserId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "KWord_kUserId_fkey" FOREIGN KEY ("kUserId") REFERENCES "KUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KWord_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "KGuild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

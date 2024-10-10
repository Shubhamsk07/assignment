-- CreateTable
CREATE TABLE "animeList" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "Image" TEXT NOT NULL,

    CONSTRAINT "animeList_pkey" PRIMARY KEY ("id")
);

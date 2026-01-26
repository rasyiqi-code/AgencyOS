-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "screens" JSONB NOT NULL,
    "apis" JSONB NOT NULL,
    "totalHours" INTEGER NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "complexity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

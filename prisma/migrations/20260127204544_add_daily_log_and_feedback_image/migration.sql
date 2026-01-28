-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMetadata" JSONB,
ADD COLUMN     "proofUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "invoiceId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "creemProductId" TEXT;

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mood" TEXT NOT NULL DEFAULT 'on_track',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "emergency_project"."reports" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "fileUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "generatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_project"."hospital_metrics" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hospital_metrics_hospitalId_metricType_timestamp_idx" ON "emergency_project"."hospital_metrics"("hospitalId", "metricType", "timestamp");

-- AddForeignKey
ALTER TABLE "emergency_project"."reports" ADD CONSTRAINT "reports_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "emergency_project"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_project"."reports" ADD CONSTRAINT "reports_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "emergency_project"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_project"."hospital_metrics" ADD CONSTRAINT "hospital_metrics_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "emergency_project"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('HATCHBACK', 'SEDAN', 'SUV', 'PICKUP');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC', 'CVT', 'DCT', 'SINGLE_SPEED');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('INFOTAINMENT', 'COMFORT', 'CONVENIENCE', 'EXTERIOR');

-- CreateTable
CREATE TABLE "Make" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "Make_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "bodyType" "BodyType" NOT NULL,
    "modelYear" INTEGER NOT NULL,
    "segment" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "drivetrain" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "lengthMm" INTEGER NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "wheelbaseMm" INTEGER NOT NULL,
    "groundClearanceMm" INTEGER,
    "cargoL" INTEGER NOT NULL,
    "fuelTankL" INTEGER,
    "batteryKwh" DOUBLE PRECISION,
    "curbWeightKg" INTEGER NOT NULL,

    CONSTRAINT "Specification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "displacementCc" INTEGER,
    "powerHp" INTEGER NOT NULL,
    "torqueNm" INTEGER NOT NULL,
    "zeroToHundredS" DOUBLE PRECISION,
    "topSpeedKmh" INTEGER,
    "efficiencyKmpl" DOUBLE PRECISION,
    "rangeKm" INTEGER,
    "consumptionKwh100km" DOUBLE PRECISION,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyRating" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "overallStars" INTEGER,
    "frontalStars" INTEGER,
    "sideStars" INTEGER,
    "rolloverStars" INTEGER,
    "airbags" INTEGER NOT NULL,
    "automaticEmergencyBrake" BOOLEAN NOT NULL,
    "laneKeepAssist" BOOLEAN NOT NULL,
    "blindSpotMonitor" BOOLEAN NOT NULL,
    "adaptiveCruise" BOOLEAN NOT NULL,

    CONSTRAINT "SafetyRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnershipCost" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "serviceIntervalKm" INTEGER NOT NULL,
    "serviceCost" INTEGER NOT NULL,
    "annualInsurance" INTEGER NOT NULL,
    "warrantyYears" INTEGER NOT NULL,
    "warrantyKm" INTEGER NOT NULL,
    "resaleValuePct5y" INTEGER NOT NULL,

    CONSTRAINT "OwnershipCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "verdict" TEXT NOT NULL,
    "pros" TEXT[],
    "cons" TEXT[],

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Make_slug_key" ON "Make"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE INDEX "Model_makeId_idx" ON "Model"("makeId");

-- CreateIndex
CREATE INDEX "Model_bodyType_idx" ON "Model"("bodyType");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_slug_key" ON "Variant"("slug");

-- CreateIndex
CREATE INDEX "Variant_modelId_idx" ON "Variant"("modelId");

-- CreateIndex
CREATE INDEX "Variant_fuelType_idx" ON "Variant"("fuelType");

-- CreateIndex
CREATE UNIQUE INDEX "Specification_variantId_key" ON "Specification"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_variantId_key" ON "Performance"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyRating_variantId_key" ON "SafetyRating"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "OwnershipCost_variantId_key" ON "OwnershipCost"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_variantId_name_key" ON "Feature"("variantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_modelId_key" ON "Review"("modelId");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyRating" ADD CONSTRAINT "SafetyRating_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipCost" ADD CONSTRAINT "OwnershipCost_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

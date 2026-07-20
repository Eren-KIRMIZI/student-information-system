-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('REQUIRED', 'ELECTIVE', 'COMMON', 'DEPARTMENT_ELECTIVE');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'PROMOTED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "courseType" "CourseType" NOT NULL DEFAULT 'REQUIRED';

-- CreateTable
CREATE TABLE "prerequisites" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "prereqCourseId" TEXT NOT NULL,
    "minGradePoint" DOUBLE PRECISION,

    CONSTRAINT "prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseSectionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promotedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_tokens" (
    "id" TEXT NOT NULL,
    "courseSectionId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_scans" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_requirements" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "totalEcts" INTEGER NOT NULL DEFAULT 240,
    "minGpa" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "maxFfCount" INTEGER NOT NULL DEFAULT 0,
    "requiredCredits" INTEGER NOT NULL,
    "maxRetakes" INTEGER NOT NULL DEFAULT 3,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "minCredits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_group_items" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "course_group_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prerequisites_courseId_prereqCourseId_key" ON "prerequisites"("courseId", "prereqCourseId");

-- CreateIndex
CREATE INDEX "waitlist_courseSectionId_status_idx" ON "waitlist"("courseSectionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_studentId_courseSectionId_key" ON "waitlist"("studentId", "courseSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_tokens_token_key" ON "qr_tokens"("token");

-- CreateIndex
CREATE INDEX "qr_tokens_token_idx" ON "qr_tokens"("token");

-- CreateIndex
CREATE INDEX "qr_tokens_courseSectionId_isActive_idx" ON "qr_tokens"("courseSectionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "qr_scans_tokenId_studentId_key" ON "qr_scans"("tokenId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_requirements_departmentId_key" ON "graduation_requirements"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "course_group_items_groupId_courseId_key" ON "course_group_items"("groupId", "courseId");

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_prereqCourseId_fkey" FOREIGN KEY ("prereqCourseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_courseSectionId_fkey" FOREIGN KEY ("courseSectionId") REFERENCES "course_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_courseSectionId_fkey" FOREIGN KEY ("courseSectionId") REFERENCES "course_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "qr_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_requirements" ADD CONSTRAINT "graduation_requirements_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_groups" ADD CONSTRAINT "course_groups_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_group_items" ADD CONSTRAINT "course_group_items_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "course_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_group_items" ADD CONSTRAINT "course_group_items_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

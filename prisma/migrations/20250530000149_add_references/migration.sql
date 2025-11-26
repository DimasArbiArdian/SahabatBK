-- CreateTable
CREATE TABLE "ModuleReference" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "ModuleReference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModuleReference" ADD CONSTRAINT "ModuleReference_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

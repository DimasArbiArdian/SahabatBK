//module/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Description is too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  references: z.array(z.string().url()).optional(), // 👈 add this
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") ?? "";

    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true, schoolId: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsedData = moduleSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { title, description, content, references = [] } = body;

    // 1. Create the module
    const module = await prisma.module.create({
      data: {
        title,
        content,
        description,
        teacherId: teacher.id,
        schoolId: teacher.schoolId ?? "",
      },
    });

    // 2. Create references if any
    if (Array.isArray(references) && references.length > 0) {
      await prisma.moduleReference.createMany({
        data: references.map((url: string) => ({
          url,
          moduleId: module.id,
        })),
      });
    }

    return NextResponse.json(
      { message: "Module berhasil dibuat", module },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Gagal membuat module" },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") ?? "";
    const userRole = req.headers.get("x-user-role") ?? "";

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    let modules = [];

    if (userRole === "STUDENT") {
      // Ambil data student untuk mendapatkan schoolId
      const student = await prisma.student.findUnique({
        where: { userId },
        select: { schoolId: true },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      // Ambil module berdasarkan schoolId
      modules = await prisma.module.findMany({
        where: { schoolId: student.schoolId },
        include: {
          teacher: { select: { user: { select: { fullname: true } } } },
        },
      });
    } else if (userRole === "TEACHER") {
      // Ambil data teacher untuk mendapatkan teacherId
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      // Ambil module berdasarkan teacherId
      modules = await prisma.module.findMany({
        where: { teacherId: teacher.id },
        include: {
          teacher: { select: { user: { select: { fullname: true } } } },
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Gagal mengambil module" },
      { status: 500 }
    );
  }
}

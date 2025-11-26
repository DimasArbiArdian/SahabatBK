import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema validasi update (fullname di User, grade & studentId di Student)
const updateStudentSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  studentId: z.string().min(5, "Student ID (NIS) must be at least 5 characters"),
  grade: z.string().min(3, "Grade is required"),
});

export async function PUT(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "User ID is required in header" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateStudentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { fullname, studentId, grade } = validatedData.data;

    // Cari user dan student berdasarkan userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user || !user.student) {
      return NextResponse.json({ message: "User or student profile not found" }, { status: 404 });
    }

    // Cek apakah studentId (NIS) sudah digunakan oleh siswa lain
    const existingStudent = await prisma.student.findUnique({
      where: { studentId },
    });

    if (existingStudent && existingStudent.userId !== userId) {
      return NextResponse.json({ message: "Student ID (NIS) already in use" }, { status: 400 });
    }

    // Update fullname di tabel User
    await prisma.user.update({
      where: { id: userId },
      data: { fullname },
    });

    // Update studentId dan grade di tabel Student
    const updatedStudent = await prisma.student.update({
      where: { id: user.student.id },
      data: { studentId, grade },
    });

    return NextResponse.json(
      { message: "Student profile updated successfully", student: updatedStudent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

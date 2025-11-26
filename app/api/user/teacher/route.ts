import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema validasi update (fullname di User, employeeId di Teacher)
const updateTeacherSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  employeeId: z.string().min(5, "Employee ID (NIP) must be at least 5 characters"),
});

export async function PUT(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "User ID is required in header" }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateTeacherSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { fullname, employeeId } = validatedData.data;

    // Cari user dan teacher berdasarkan userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: true },
    });

    if (!user || !user.teacher) {
      return NextResponse.json({ message: "User or teacher profile not found" }, { status: 404 });
    }

    // Cek apakah employeeId (NIP) sudah digunakan oleh guru lain
    const existingTeacher = await prisma.teacher.findUnique({
      where: { employeeId },
    });

    if (existingTeacher && existingTeacher.userId !== userId) {
      return NextResponse.json({ message: "Employee ID (NIP) already in use" }, { status: 400 });
    }

    // Update fullname di tabel User
    await prisma.user.update({
      where: { id: userId },
      data: { fullname },
    });

    // Update employeeId di tabel Teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: user.teacher.id },
      data: { employeeId },
    });

    return NextResponse.json(
      { message: "Teacher profile updated successfully", teacher: updatedTeacher },
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

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = Promise<{ id: any }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const userId = req.headers.get("x-user-id") ?? "";
    const userRole = req.headers.get("x-user-role") ?? "";

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    // Dapatkan schoolId berdasarkan role
    let schoolId: string | null = null;

    if (userRole === "STUDENT") {
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

      schoolId = student.schoolId;
    } else if (userRole === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { schoolId: true },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      schoolId = teacher.schoolId ?? "";
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    // Ambil module berdasarkan schoolId
    const module = await prisma.module.findUnique({
      where: {
        id: id,
        schoolId: schoolId, // Pastikan hanya module dari sekolah yang sama
      },
      include: {
        teacher: { select: { user: { select: { fullname: true } } } },
        references: true,
      },
    });

    console.log(module)

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail module" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id") ?? "";
    const userRole = req.headers.get("x-user-role") ?? "";

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    if (userRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can delete modules" },
        { status: 403 }
      );
    }

    // Cek apakah teacher ini ada di sekolah yang sesuai
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { schoolId: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const module = await prisma.module.findUnique({
      where: { id: id },
      select: { schoolId: true },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (module.schoolId !== teacher.schoolId) {
      return NextResponse.json(
        { error: "You can only delete modules from your school" },
        { status: 403 }
      );
    }

    // Hapus module jika semua validasi lolos
    await prisma.module.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Gagal menghapus module" },
      { status: 500 }
    );
  }
}

//pending route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") ?? "";
    const userRole = req.headers.get("x-user-role") ?? "";

    if (userRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can view pending schedules" },
        { status: 403 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true, schoolId: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Ambil semua permintaan meeting yang belum dikonfirmasi di sekolah yang sama
    const pendingSchedules = await prisma.schedule.findMany({
      where: {
        status: "PENDING",
        student: { schoolId: teacher.schoolId ?? "" },
      },
      include: {
        student: {
          select: {
            user: {
              select: {
                id: true,
                fullname: true,
                student: { select: { grade: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(pendingSchedules);
  } catch (error) {
    console.error("Error fetching pending schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending schedules" },
      { status: 500 }
    );
  }
}

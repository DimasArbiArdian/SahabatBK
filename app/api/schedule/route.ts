import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const scheduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") ?? "";
    const userRole = req.headers.get("x-user-role") ?? "";

    if (userRole !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can create a schedule" },
        { status: 403 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, schoolId: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsedData = scheduleSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { title, description, date } = parsedData.data;

    // Buat schedule baru
    const schedule = await prisma.schedule.create({
      data: {
        studentId: student.id,
        title,
        description,
        date: new Date(date),
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Schedule request created", schedule },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
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

    let schedules = [];

    if (userRole === "STUDENT") {
      // Ambil semua schedule milik student
      const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      schedules = await prisma.schedule.findMany({
        where: { studentId: student.id },
        include: {
          counselor: {
            select: { user: { select: { fullname: true } }, phoneNumber: true },
          },
        },
      });
    } else if (userRole === "TEACHER") {
      // Ambil semua schedule yang sudah diterima oleh teacher
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

      schedules = await prisma.schedule.findMany({
        where: { counselorId: teacher.id, status: { not: "PENDING" } },
        include: {
          student: {
            select: {
              user: {
                select: {
                  fullname: true,
                },
              },
              phoneNumber: true,
              grade: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/app/utils/mailer";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema validasi input
const studentSchema = z.object({
  email: z.string().email("Invalid email format"),
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  studentId: z
    .string()
    .min(5, "Student ID (NIS) must be at least 5 characters"),
  grade: z.string().min(3, "Grade is required"),
  schoolId: z.string(),
  phoneNumber: z
    .string()
    .regex(
      /^62\d{9,13}$/,
      "Phone number must start with 62 and be between 10-14 digits"
    ), // Validasi nomor HP
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = studentSchema.safeParse(body);

    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      const firstError =
        Object.values(errors)
          .flat()
          .find((err) => err) || "Validation error";

      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const {
      email,
      fullname,
      password,
      studentId,
      grade,
      schoolId,
      phoneNumber,
    } = validatedData.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.random().toString(36).substring(2, 8);

    await prisma.user.create({
      data: {
        email,
        fullname,
        password: hashedPassword,
        role: Role.STUDENT,
        verificationCode,
        student: {
          create: { studentId, grade, schoolId, phoneNumber }, // Menyimpan phoneNumber
        },
      },
      include: { student: true },
    });

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { message: "Student registered. Check your email for verification." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

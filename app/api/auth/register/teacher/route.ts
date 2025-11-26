// Backend: API Route
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/app/utils/mailer";
import { z } from "zod";

const prisma = new PrismaClient();

const teacherSchema = z.object({
  email: z.string().email("Invalid email format"),
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employeeId: z
    .string()
    .min(5, "Employee ID (NIP) must be at least 5 characters"),
  phoneNumber: z
    .string()
    .regex(
      /^62\d{9,12}$/,
      "Phone number must start with 62 and be 11-14 digits long"
    ),
  schoolId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = teacherSchema.safeParse(body);

    if (!validatedData.success) {
      const errors = validatedData.error.flatten().fieldErrors;
      const firstError =
        Object.values(errors)
          .flat()
          .find((err) => err) || "Validation error";

      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { email, fullname, password, employeeId, phoneNumber, schoolId } =
      validatedData.data;

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
        role: Role.TEACHER,
        verificationCode,
        teacher: {
          create: { employeeId, phoneNumber, schoolId },
        },
      },
      include: { teacher: true },
    });

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { message: "Teacher registered. Check your email for verification." },
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

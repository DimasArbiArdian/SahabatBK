//school.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema validasi input
const schoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      select: { id: true, name: true },
    });

    return NextResponse.json({ schools }, { status: 200 });
  } catch (error) {
    console.error("Fetch Schools Error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = schoolSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { name, address } = validatedData.data;

    const existingSchool = await prisma.school.findUnique({ where: { name } });
    if (existingSchool) {
      return NextResponse.json({ message: "School name already in use" }, { status: 400 });
    }

    const school = await prisma.school.create({
      data: { name, address },
    });

    return NextResponse.json(
      { message: "School registered successfully", school },
      { status: 200 }
    );
  } catch (error) {
    console.error("School Registration Error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

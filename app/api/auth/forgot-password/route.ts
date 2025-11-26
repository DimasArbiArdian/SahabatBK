import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendResetPasswordEmail } from "@/app/utils/mailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const resetToken = Math.random().toString(36).substring(2, 8);

    await prisma.user.update({
      where: { email },
      data: { resetToken },
    });

    await sendResetPasswordEmail(email, resetToken);

    return NextResponse.json({ message: "Password reset link sent." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong", error }, { status: 500 });
  }
}

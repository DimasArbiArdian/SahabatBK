import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

const secretKey = process.env.NEXTAUTH_SECRET || "";
const key = new TextEncoder().encode(secretKey);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });

    // Cek apakah user ada dan sudah terverifikasi
    if (!user || !user.verified) {
      return NextResponse.json(
        { message: "User not found or not verified" },
        { status: 400 }
      );
    }

    // Bandingkan password yang diberikan dengan yang ada di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Buat token JWT menggunakan `jose`
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(key);

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/utils/auth"; // Sesuaikan dengan path utils auth

export async function middleware(req: NextRequest) {
  // Bypass middleware untuk rute auth (misalnya `/api/auth/*`)
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  // ⬇️ Tambahkan `await` di sini! ⬇️
  const decoded = await verifyToken(token);

  if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
    console.log(decoded);
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Simpan decoded ke request agar bisa diakses di route handler
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", decoded.id as string);
  requestHeaders.set("x-user-email", decoded.email as string);
  requestHeaders.set("x-user-role", decoded.role as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Tentukan rute yang akan menggunakan middleware
export const config = {
  matcher: "/api/:path*", // Semua API kecuali yang ada di `/api/auth/*`
};

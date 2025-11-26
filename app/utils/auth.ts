import { jwtVerify } from "jose";

const SECRET_KEY = process.env.NEXTAUTH_SECRET ?? "";
const key = new TextEncoder().encode(SECRET_KEY);

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload; // Payload ini berisi { id, email, role }
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}

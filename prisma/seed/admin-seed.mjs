import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com"; // Ganti dengan email admin default
  const adminPassword = "admin123"; // Ganti dengan password admin default

  // Cek apakah ada admin di database
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (adminExists)
    await prisma.user.deleteMany({
      where: {
        role: "ADMIN",
      },
    });

  // if (!adminExists) {
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      fullname: "Super Admin",
      password: hashedPassword,
      role: "ADMIN",
      verified: true,
    },
  });

  console.log("✅ Admin created successfully!");
  // } else {
  //   console.log("✅ Admin already exists, skipping creation.");
  // }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

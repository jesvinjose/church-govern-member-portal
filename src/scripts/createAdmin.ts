import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAdmin() {
  const tenant = await prisma.tenant.findFirst({
    where: {
      slug: "st-joseph"
    }
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const role = await prisma.role.findFirst({
    where: {
      name: "ADMIN"
    }
  });

  if (!role) {
    throw new Error("ADMIN role not found");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: "john@stjoseph.com"
    }
  });

  if (existingUser) {
    console.log("Admin already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const user = await prisma.user.create({
    data: {
      first_name: "John",
      last_name: "Mathew",
      email: "john@stjoseph.com",
      phone: "9999999999",
      password_hash: passwordHash,

      // user belongs to a church
      tenant_id: tenant.id,

      roles: {
        create: {
          role_id: role.id
        }
      }
    },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  console.log("Admin created:", user.id);
  return user;
}

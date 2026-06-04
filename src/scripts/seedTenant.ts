import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedTenant() {
  const existing = await prisma.tenant.findFirst({
    where: {
      slug: "st-joseph"
    }
  });

  if (existing) {
    console.log("Tenant already exists");
    return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: "St Josephs Church",
      slug: "st-joseph",
      email: "admin@stjoseph.com"
    }
  });

  console.log("Tenant created:", tenant.id);

  return tenant;
}


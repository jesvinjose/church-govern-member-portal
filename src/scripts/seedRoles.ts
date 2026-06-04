import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRoles() {
  await prisma.role.createMany({
    data: [
      {
        name: "SUPER_ADMIN",
        description: "Platform admin",
        tenant_id: null
      },
      {
        name: "ADMIN",
        description: "Church admin",
        tenant_id: null
      },
      {
        name: "STAFF",
        description: "Church staff",
        tenant_id: null
      }
    ],
    skipDuplicates: true
  });

  console.log("Roles seeded");
}


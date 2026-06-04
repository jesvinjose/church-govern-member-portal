import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRelations() {
  const tenant = await prisma.tenant.findFirst({
    where: {
      slug: "st-joseph",
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found. Run seedTenant first.");
  }

  const relations = [
    { name: "HEAD", order: 1 },
    { name: "HUSBAND", order: 2 },
    { name: "WIFE", order: 3 },
    { name: "SON", order: 4 },
    { name: "DAUGHTER", order: 5 },
    { name: "FATHER", order: 6 },
    { name: "MOTHER", order: 7 },
    { name: "BROTHER", order: 8 },
    { name: "SISTER", order: 9 },
    { name: "GRANDSON", order: 10 },
    { name: "GRANDDAUGHTER", order: 11 },
  ];

  for (const relation of relations) {
    const exists = await prisma.relation.findFirst({
      where: {
        tenant_id: tenant.id,
        name: relation.name,
      },
    });

    if (exists) {
      console.log(`ℹ Relation already exists: ${relation.name}`);
      continue;
    }


    await prisma.relation.create({
      data: {
        ...relation,
        tenant_id: tenant.id,
      },
    });
    console.log(`✓ Created relation: ${relation.name}`);
  }

  console.log(`Seeding relations for tenant: ${tenant.name}`);
}

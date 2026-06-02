import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenantId = '1926650e-1792-4426-a095-50b8b0bd68bd'

  await prisma.relation.createMany({
    data: [
      { name: 'HEAD', tenant_id: tenantId, order: 1 },
      { name: 'WIFE', tenant_id: tenantId, order: 2 },
      { name: 'SON', tenant_id: tenantId, order: 3 },
      { name: 'DAUGHTER', tenant_id: tenantId, order: 4 },
      { name: 'GRANDDAUGHTER', tenant_id: tenantId, order: 5 }
    ]
  })

  console.log('Relations seeded')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
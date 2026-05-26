import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenantId = '1926650e-1792-4426-a095-50b8b0bd68bd'

  await prisma.role.createMany({
    data: [
      {
        name: 'ADMIN',
        description: 'Church admin',
        tenant_id: tenantId
      },
      {
        name: 'STAFF',
        description: 'Church staff',
        tenant_id: tenantId
      },
      {
        name: 'SUPER_ADMIN',
        description: 'Platform admin',
        tenant_id: null
      }
    ]
  })

  console.log('Roles created')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
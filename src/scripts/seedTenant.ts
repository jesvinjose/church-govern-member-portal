import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'St Josephs Church',
      slug: 'st-joseph',
      email: 'admin@stjoseph.com'
    }
  })

  console.log(tenant)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
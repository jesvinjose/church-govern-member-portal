import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenantId = '1926650e-1792-4426-a095-50b8b0bd68bd'

  const role = await prisma.role.findFirst({
    where: {
      tenant_id: tenantId,
      name: 'ADMIN'
    }
  })

  if (!role) {
    throw new Error('Role not found')
  }

  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const user = await prisma.user.create({
    data: {
      first_name: 'John',
      last_name: 'Mathew',
      email: 'john@stjoseph.com',
      phone: '9999999999',
      password_hash: passwordHash,
      tenant_id: tenantId,

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
  })

  console.log(user)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
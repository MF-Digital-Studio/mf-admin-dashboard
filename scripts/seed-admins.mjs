import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const required = (value, key) => {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return String(value).trim()
}

const normalizeEmail = (value) => value.trim().toLowerCase()

const buildAdminInput = (prefix, defaultName) => {
  const name = process.env[`${prefix}_NAME`] || defaultName
  const email = normalizeEmail(required(process.env[`${prefix}_EMAIL`], `${prefix}_EMAIL`))
  const password = required(process.env[`${prefix}_PASSWORD`], `${prefix}_PASSWORD`)

  if (password.length < 10) {
    throw new Error(`${prefix}_PASSWORD must be at least 10 characters`)
  }

  return { name, email, password }
}

const upsertAdmin = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 12)

  return prisma.adminUser.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash,
      isActive: true,
    },
    update: {
      name,
      passwordHash,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  })
}

async function main() {
  const faruk = buildAdminInput('ADMIN_FARUK', 'Faruk')
  const muratcan = buildAdminInput('ADMIN_MURATCAN', 'Muratcan')

  const [farukResult, muratcanResult] = await Promise.all([upsertAdmin(faruk), upsertAdmin(muratcan)])

  console.log('Admin users seeded successfully:')
  console.log(`- ${farukResult.name} (${farukResult.email}) [${farukResult.id}]`)
  console.log(`- ${muratcanResult.name} (${muratcanResult.email}) [${muratcanResult.id}]`)
}

main()
  .catch((error) => {
    console.error('Failed to seed admin users')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

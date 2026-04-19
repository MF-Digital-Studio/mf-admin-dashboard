import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApiAccess } from '@/lib/auth/require-admin-api'

export async function GET() {
  const adminCheck = await requireAdminApiAccess()
  if (!adminCheck.ok) {
    return adminCheck.response
  }

  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return NextResponse.json(admins)
}

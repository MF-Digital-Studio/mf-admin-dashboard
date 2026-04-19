import bcrypt from 'bcryptjs'

const DEFAULT_BCRYPT_ROUNDS = 12

export async function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, DEFAULT_BCRYPT_ROUNDS)
}

export async function verifyPassword(plainPassword: string, passwordHash: string) {
  return bcrypt.compare(plainPassword, passwordHash)
}

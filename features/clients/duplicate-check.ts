import { normalizeEmail, normalizeNameForComparison, normalizePhoneDigits, normalizeWhatsApp } from '@/features/clients/normalizers'

type DuplicateField = 'name' | 'phone' | 'whatsapp' | 'email'

interface ClientIdentity {
  id: string
  companyName: string
  email: string | null
  phone: string
  whatsapp: string | null
}

interface DuplicateCheckInput {
  companyName: string
  email: string | null | undefined
  phone: string | null | undefined
  whatsapp: string | null | undefined
}

export function getDuplicateMessage(field: DuplicateField): string {
  if (field === 'name') return 'Bu isimde bir müşteri zaten kayıtlı.'
  if (field === 'phone') return 'Bu telefon numarası başka bir müşteride kayıtlı.'
  if (field === 'whatsapp') return 'Bu WhatsApp numarası başka bir müşteride kayıtlı.'
  return 'Bu e-posta ile kayıtlı bir müşteri zaten var.'
}

export function findDuplicateField(
  clients: ClientIdentity[],
  input: DuplicateCheckInput,
  options?: { excludeId?: string }
): DuplicateField | null {
  const inputName = normalizeNameForComparison(input.companyName)
  const inputEmail = normalizeEmail(input.email)
  const inputPhone = normalizePhoneDigits(input.phone)
  const inputWhatsApp = normalizeWhatsApp(input.whatsapp)

  for (const client of clients) {
    if (options?.excludeId && client.id === options.excludeId) {
      continue
    }

    const existingName = normalizeNameForComparison(client.companyName)
    const existingEmail = normalizeEmail(client.email)
    const existingPhone = normalizePhoneDigits(client.phone)
    const existingWhatsApp = normalizeWhatsApp(client.whatsapp)

    if (inputName && existingName && inputName === existingName) {
      return 'name'
    }

    if (inputEmail && existingEmail && inputEmail === existingEmail) {
      return 'email'
    }

    if (inputPhone && (inputPhone === existingPhone || inputPhone === existingWhatsApp)) {
      return 'phone'
    }

    if (inputWhatsApp && (inputWhatsApp === existingWhatsApp || inputWhatsApp === existingPhone)) {
      return 'whatsapp'
    }
  }

  return null
}

function trimToNull(value: string | null | undefined): string | null {
  const normalized = (value ?? '').trim()
  return normalized.length > 0 ? normalized : null
}

export function normalizeNameForComparison(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  if (!normalized) {
    return null
  }

  return normalized.replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
}

function ensureHttps(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value
  }
  return `https://${value}`
}

export function normalizeEmail(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  return normalized ? normalized.toLowerCase() : null
}

export function normalizeInstagram(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  if (!normalized) {
    return null
  }

  if (normalized.includes('instagram.com')) {
    return ensureHttps(normalized)
  }

  const username = normalized.replace(/^@+/, '').replace(/^\/+|\/+$/g, '')
  return username ? `https://instagram.com/${username}` : null
}

export function normalizeWebsite(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  if (!normalized) {
    return null
  }
  return ensureHttps(normalized)
}

export function normalizeLocation(value: string | null | undefined): string | null {
  return trimToNull(value)
}

export function normalizeCategory(value: string | null | undefined): string | null {
  return trimToNull(value)
}

function extractWhatsAppDigits(value: string): string {
  if (value.includes('wa.me/')) {
    return value.split('wa.me/')[1]?.split('?')[0]?.replace(/\D/g, '') ?? ''
  }

  if (value.includes('api.whatsapp.com/send')) {
    const directPhone = value.match(/[?&]phone=([+\d]+)/i)?.[1] ?? ''
    return directPhone.replace(/\D/g, '')
  }

  return value.replace(/\D/g, '')
}

function normalizeTurkishWhatsAppDigits(digits: string): string {
  if (digits.startsWith('0090')) {
    return digits.slice(2)
  }

  if (digits.startsWith('90')) {
    return digits
  }

  if (digits.startsWith('0')) {
    return `90${digits.slice(1)}`
  }

  if (digits.startsWith('5')) {
    return `90${digits}`
  }

  return digits
}

export function normalizePhoneDigits(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  if (!normalized) {
    return null
  }

  const digits = normalizeTurkishWhatsAppDigits(normalized.replace(/\D/g, ''))
  return digits.length > 0 ? digits : null
}

export function normalizeWhatsApp(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  if (!normalized) {
    return null
  }

  const digits = normalizeTurkishWhatsAppDigits(extractWhatsAppDigits(normalized))
  if (!digits) {
    return null
  }

  return digits
}

export function toWhatsAppLink(whatsAppValue: string | null | undefined, phoneValue: string | null | undefined): string | null {
  const normalized = normalizeWhatsApp(whatsAppValue) ?? normalizeWhatsApp(phoneValue)
  return normalized ? `https://wa.me/${normalized}` : null
}

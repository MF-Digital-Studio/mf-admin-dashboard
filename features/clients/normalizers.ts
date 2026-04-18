function trimToNull(value: string | null | undefined): string | null {
  const normalized = (value ?? '').trim()
  return normalized.length > 0 ? normalized : null
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

export function normalizeWhatsApp(value: string | null | undefined): string | null {
  const normalized = trimToNull(value)
  if (!normalized) {
    return null
  }

  const digits = extractWhatsAppDigits(normalized)
  if (!digits) {
    return null
  }

  return `https://wa.me/${digits}`
}

export function toWhatsAppLink(whatsAppValue: string | null | undefined, phoneValue: string | null | undefined): string | null {
  return normalizeWhatsApp(whatsAppValue) ?? normalizeWhatsApp(phoneValue)
}


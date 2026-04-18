export function getMainPaymentMarker(projectId: string): string {
  return `[PROJECT_MAIN_PAYMENT:${projectId}]`
}

export function getLegacyMainPaymentMarker(projectId: string): string {
  return `[PROJECT_PAYMENT_COMPLETED:${projectId}]`
}

export function getExtraPaymentMarker(projectId: string): string {
  return `[PROJECT_EXTRA_PAYMENT:${projectId}]`
}

export function isMainProjectPaymentNote(projectId: string, notes: string | null | undefined): boolean {
  if (!notes) {
    return false
  }

  return notes.includes(getMainPaymentMarker(projectId)) || notes.includes(getLegacyMainPaymentMarker(projectId))
}


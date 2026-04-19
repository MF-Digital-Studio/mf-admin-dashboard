const splitAndNormalize = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

export function isAllowedAdminUserId(userId?: string | null) {
  const allowedUserIds = splitAndNormalize(process.env.ADMIN_CLERK_USER_IDS)

  if (allowedUserIds.length === 0) {
    return false
  }

  return Boolean(userId && allowedUserIds.includes(userId))
}

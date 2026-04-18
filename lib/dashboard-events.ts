const DASHBOARD_DATA_REFRESH_EVENT = 'dashboard:data-refresh'

export function emitDashboardDataRefresh(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(DASHBOARD_DATA_REFRESH_EVENT))
}

export function onDashboardDataRefresh(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const listener = () => {
    callback()
  }

  window.addEventListener(DASHBOARD_DATA_REFRESH_EVENT, listener)

  return () => {
    window.removeEventListener(DASHBOARD_DATA_REFRESH_EVENT, listener)
  }
}

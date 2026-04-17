export function formatCurrency(value: number) {
  return `₺${value.toLocaleString('en-US')}`
}

export function formatCompactCurrency(value: number) {
  return `₺${(value / 1000).toFixed(0)}k`
}


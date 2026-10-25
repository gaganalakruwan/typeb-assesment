export function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  return formatter.format(new Date(y, m - 1, d))
}

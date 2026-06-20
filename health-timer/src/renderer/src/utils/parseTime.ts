const MIN_SECONDS = 5

export function parseTimeInput(str: string): number | null {
  const match = str.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/)
  if (!match) return null

  const h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const s = parseInt(match[3], 10)

  if (h > 11 || m >= 60 || s >= 60) return null

  const total = h * 3600 + m * 60 + s
  if (total < MIN_SECONDS) return null

  return total
}

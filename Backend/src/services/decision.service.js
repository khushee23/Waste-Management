export const decideOverflow = (overflowLevel) => {
  const level = Number(overflowLevel)
  if (!Number.isFinite(level)) return "normal"
  if (level >= 80) return "overflow"
  if (level >= 50) return "moderate"
  return "normal"
}


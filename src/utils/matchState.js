export function toNumericScore(score) {
  const value = Number(score ?? 0)
  return Number.isFinite(value) ? value : 0
}

export function hasAnyScore(match) {
  return (
    toNumericScore(match?.scoreL) !== 0 ||
    toNumericScore(match?.scoreR) !== 0
  )
}

export function isMatchPlayed(match) {
  return hasAnyScore(match)
}
export function hasEnteredScore(score) {
  return (
    (typeof score === 'number' || typeof score === 'string') &&
    String(score).trim() !== '' &&
    Number.isFinite(Number(score))
  )
}

export function toNullableScore(score) {
  return hasEnteredScore(score) ? Number(score) : null
}

export function toNumericScore(score) {
  const value = Number(score ?? 0)
  return Number.isFinite(value) ? value : 0
}

export function hasAnyScore(match) {
  return (
    match?.teamL !== 'VRIJ' &&
    match?.teamR !== 'VRIJ' &&
    (hasEnteredScore(match?.scoreL) || hasEnteredScore(match?.scoreR))
  )
}

export function isMatchPlayed(match) {
  return (
    match?.teamL === 'VRIJ' ||
    match?.teamR === 'VRIJ' ||
    (hasEnteredScore(match?.scoreL) && hasEnteredScore(match?.scoreR))
  )
}
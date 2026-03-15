// Test fixture data: sample teams and players

/**
 * Standard saved teams as returned by the API (fetchSavedTeams)
 * Each entry has a `team` property with the canonical team name
 */
export const sampleSavedTeamsFromApi = [
  { team: 'Alice/Bob' },
  { team: 'Carol/Dave' },
  { team: 'Eve/Frank' },
  { team: 'Grace/Hank' },
  { team: 'Ivy/Jack' },
  { team: 'Kim/Leo' },
]

/**
 * Saved teams as stored in localStorage / component state (just strings)
 */
export const sampleSavedTeams = [
  'Alice/Bob',
  'Carol/Dave',
  'Eve/Frank',
  'Grace/Hank',
  'Ivy/Jack',
  'Kim/Leo',
]

/**
 * All players as returned by fetchAllPlayers API
 */
export const samplePlayers = [
  { naam: 'Alice' },
  { naam: 'Bob' },
  { naam: 'Carol' },
  { naam: 'Dave' },
  { naam: 'Eve' },
  { naam: 'Frank' },
  { naam: 'Grace' },
  { naam: 'Hank' },
  { naam: 'Ivy' },
  { naam: 'Jack' },
  { naam: 'Kim' },
  { naam: 'Leo' },
]

/**
 * A set of 4 tournament teams (minimum for starting)
 */
export const fourTeams = ['Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank']

/**
 * A set of 7 tournament teams (triggers group tournament prompt)
 */
export const sevenTeams = [
  'Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank',
  'Ivy/Jack', 'Kim/Leo', 'Mia/Nick',
]

/**
 * A set of 8 tournament teams (maximum)
 */
export const eightTeams = [
  'Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank',
  'Ivy/Jack', 'Kim/Leo', 'Mia/Nick', 'Olivia/Pete',
]

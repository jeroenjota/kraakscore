// Test fixture data: sample ranking

/**
 * Ranking data as returned by fetchRanking API
 * Each entry: { speler, scores: [{ datum, punten }] }
 */
export const sampleRankingData = [
  {
    speler: 'Alice',
    scores: [
      { datum: '2025-01-15T00:00:00.000Z', punten: 10 },
      { datum: '2025-02-12T00:00:00.000Z', punten: 8 },
      { datum: '2025-03-20T00:00:00.000Z', punten: 12 },
      { datum: '2025-04-10T00:00:00.000Z', punten: 6 },
      { datum: '2025-05-01T00:00:00.000Z', punten: 9 },
      { datum: '2025-06-15T00:00:00.000Z', punten: 11 },
      { datum: '2025-07-10T00:00:00.000Z', punten: 7 },  // 2nd semester
    ],
  },
  {
    speler: 'Bob',
    scores: [
      { datum: '2025-01-15T00:00:00.000Z', punten: 10 },
      { datum: '2025-02-12T00:00:00.000Z', punten: 8 },
      { datum: '2025-03-20T00:00:00.000Z', punten: 12 },
    ],
  },
  {
    speler: 'Carol',
    scores: [
      { datum: '2025-01-15T00:00:00.000Z', punten: 5 },
      { datum: '2025-03-20T00:00:00.000Z', punten: 14 },
      { datum: '2025-05-01T00:00:00.000Z', punten: 3 },
    ],
  },
  {
    speler: 'Dave',
    scores: [
      { datum: '2025-07-10T00:00:00.000Z', punten: 15 },
      { datum: '2025-09-05T00:00:00.000Z', punten: 10 },
    ],
  },
  {
    speler: 'Eve',
    scores: [
      { datum: '2025-01-15T00:00:00.000Z', punten: 7 },
      { datum: '2025-02-12T00:00:00.000Z', punten: 7 },
      { datum: '2025-03-20T00:00:00.000Z', punten: 7 },
      { datum: '2025-04-10T00:00:00.000Z', punten: 7 },
      { datum: '2025-05-01T00:00:00.000Z', punten: 7 },
      { datum: '2025-06-15T00:00:00.000Z', punten: 7 },
      { datum: '2025-07-10T00:00:00.000Z', punten: 20 }, // 2nd semester, should not count in 1st
    ],
  },
]

/**
 * Expected ranking for semester 2025-1 (Jan-Jun) after filterRankingByPeriod
 * Best 6 scores per player
 */
export const expectedRanking2025S1 = [
  // Alice: all 6 first-semester scores: 10+8+12+6+9+11 = 56
  // Bob: 10+8+12 = 30
  // Carol: 5+14+3 = 22
  // Eve: 7*6 = 42
  // Dave: 0 (no scores in S1)
  // Order: Alice(56), Eve(42), Bob(30), Carol(22)
  { speler: 'Alice', totaal: 56, plaats: 1 },
  { speler: 'Eve', totaal: 42, plaats: 2 },
  { speler: 'Bob', totaal: 30, plaats: 3 },
  { speler: 'Carol', totaal: 22, plaats: 4 },
]

/**
 * Ranking data with ties for testing position assignment
 */
export const sampleRankingWithTies = [
  {
    speler: 'Player1',
    scores: [{ datum: '2025-01-15T00:00:00.000Z', punten: 10 }],
  },
  {
    speler: 'Player2',
    scores: [{ datum: '2025-01-15T00:00:00.000Z', punten: 10 }],
  },
  {
    speler: 'Player3',
    scores: [{ datum: '2025-01-15T00:00:00.000Z', punten: 5 }],
  },
]

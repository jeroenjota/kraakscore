// Test fixture data: sample tournaments

/**
 * Sample tournaments with dates spanning two semesters of 2025
 */
export const sampleToernooien = [
  {
    id: 1,
    datum: '2025-01-15T00:00:00.000Z',
    teams: JSON.stringify(['Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank']),
    matches: JSON.stringify([
      [
        { teamL: 'Alice/Bob', teamR: 'Carol/Dave', scoreL: 3, scoreR: 1, tafel: 1 },
        { teamL: 'Eve/Frank', teamR: 'Grace/Hank', scoreL: 2, scoreR: 2, tafel: 2 },
      ],
    ]),
    groepsToernooi: 0,
    repeatRounds: 1,
  },
  {
    id: 2,
    datum: '2025-03-20T00:00:00.000Z',
    teams: JSON.stringify(['Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank', 'Ivy/Jack']),
    matches: JSON.stringify([]),
    groepsToernooi: 0,
    repeatRounds: 1,
  },
  {
    id: 3,
    datum: '2025-07-10T00:00:00.000Z',
    teams: JSON.stringify(['Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank']),
    matches: JSON.stringify([]),
    groepsToernooi: 0,
    repeatRounds: 2,
  },
  {
    id: 4,
    datum: '2025-09-05T00:00:00.000Z',
    teams: JSON.stringify(['Alice/Bob', 'Eve/Frank', 'Grace/Hank', 'Ivy/Jack']),
    matches: JSON.stringify([]),
    groepsToernooi: 0,
    repeatRounds: 1,
  },
]

/**
 * A single tournament detail as returned by fetchToernooi(id)
 */
export const sampleToernooiDetail = {
  id: 1,
  datum: '2025-01-15T00:00:00.000Z',
  teams: JSON.stringify(['Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank']),
  matches: JSON.stringify([
    [
      { teamL: 'Alice/Bob', teamR: 'Carol/Dave', scoreL: 3, scoreR: 1, tafel: 1 },
      { teamL: 'Eve/Frank', teamR: 'Grace/Hank', scoreL: 2, scoreR: 2, tafel: 2 },
    ],
  ]),
  groups: null,
  groupMatches: null,
  finalMatches: null,
  groepsToernooi: 0,
  repeatRounds: 1,
}

/**
 * A group tournament detail (7+ teams, two groups)
 */
export const sampleGroepsToernooiDetail = {
  id: 5,
  datum: '2025-05-01T00:00:00.000Z',
  teams: JSON.stringify([
    'Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank',
    'Ivy/Jack', 'Kim/Leo', 'Mia/Nick',
  ]),
  matches: null,
  groups: JSON.stringify([
    ['Alice/Bob', 'Carol/Dave', 'Eve/Frank', 'Grace/Hank'],
    ['Ivy/Jack', 'Kim/Leo', 'Mia/Nick'],
  ]),
  groupMatches: JSON.stringify([
    [
      [{ teamL: 'Alice/Bob', teamR: 'Carol/Dave', scoreL: 2, scoreR: 1, tafel: 1 }],
    ],
    [
      [{ teamL: 'Ivy/Jack', teamR: 'Kim/Leo', scoreL: 0, scoreR: 3, tafel: 1 }],
    ],
  ]),
  finalMatches: JSON.stringify([
    [{ teamL: 'Alice/Bob', teamR: 'Kim/Leo', scoreL: 3, scoreR: 0, tafel: 1 }],
  ]),
  groepsToernooi: 1,
  repeatRounds: 1,
}

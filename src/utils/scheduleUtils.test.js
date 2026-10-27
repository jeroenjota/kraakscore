import assert from 'node:assert/strict'
import { test } from 'node:test'
import { swapTeamsInSchedule } from './scheduleUtils.js'

function schedule(teams) {
  const rotation = [...teams]
  if (rotation.length % 2) rotation.push('VRIJ')
  return Array.from({ length: rotation.length - 1 }, () => {
    const round = Array.from({ length: rotation.length / 2 }, (_, index) => {
      const teamL = rotation[index]
      const teamR = rotation[rotation.length - 1 - index]
      const isBye = teamL === 'VRIJ' || teamR === 'VRIJ'
      return { tafel: index + 1, teamL, teamR, scoreL: isBye ? 0 : null, scoreR: isBye ? 0 : null }
    })
    rotation.splice(1, 0, rotation.pop())
    return round
  })
}

for (const count of [3, 4, 5, 6, 7, 8]) {
  test(`all possible swaps preserve a complete schedule for ${count} teams`, () => {
    const teams = Array.from({ length: count }, (_, index) => `Team ${index + 1}`)
    const participants = count % 2 ? [...teams, 'VRIJ'] : teams
    for (const teamA of participants) {
      for (const teamB of participants) {
        const rounds = schedule(teams)
        const before = structuredClone(rounds)
        swapTeamsInSchedule(rounds, teamA, teamB)
        const pairs = new Set()
        for (const round of rounds) {
          assert.deepEqual(round.flatMap(match => [match.teamL, match.teamR]).sort(), [...participants].sort())
          for (const match of round) {
            const pair = JSON.stringify([match.teamL, match.teamR].sort())
            assert.equal(pairs.has(pair), false)
            pairs.add(pair)
            const isBye = match.teamL === 'VRIJ' || match.teamR === 'VRIJ'
            assert.equal(match.scoreL, isBye ? 0 : null)
            assert.equal(match.scoreR, isBye ? 0 : null)
          }
        }
        assert.equal(pairs.size, participants.length * (participants.length - 1) / 2)
        swapTeamsInSchedule(rounds, teamA, teamB)
        assert.deepEqual(rounds, before)
      }
    }
  })
}

test('only the selected group changes, with repeated cycles preserved', () => {
  const groups = [
    [...schedule(['A', 'B', 'C', 'D']), ...schedule(['A', 'B', 'C', 'D'])],
    schedule(['E', 'F', 'G', 'H']),
  ]
  const otherGroup = structuredClone(groups[1])
  swapTeamsInSchedule(groups[0], 'A', 'C')
  assert.deepEqual(groups[0].slice(0, 3), groups[0].slice(3))
  assert.deepEqual(groups[1], otherGroup)
  assert.equal(groups[0][0][0].teamL, 'C')
})

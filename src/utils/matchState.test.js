import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasAnyScore, hasEnteredScore, isMatchPlayed, toNullableScore } from './matchState.js'

test('missing scores remain null, while explicit zero is a score', () => {
  for (const value of [null, undefined, '', ' ', NaN, Infinity, 'invalid', false]) {
    assert.equal(hasEnteredScore(value), false)
    assert.equal(toNullableScore(value), null)
  }
  for (const value of [0, '0', 1500, '1500']) {
    assert.equal(hasEnteredScore(value), true)
    assert.equal(toNullableScore(value), Number(value))
  }
})

test('both scores must be entered to finish a match', () => {
  const match = { teamL: 'A', teamR: 'B' }
  for (const scoreL of [null, undefined, '', 0, 100]) {
    for (const scoreR of [null, undefined, '', 0, 100]) {
      assert.equal(
        isMatchPlayed({ ...match, scoreL, scoreR }),
        typeof scoreL === 'number' && typeof scoreR === 'number',
      )
    }
  }
})

test('a single entered score, including zero, prevents discarding a started tournament', () => {
  assert.equal(hasAnyScore({ scoreL: null, scoreR: null }), false)
  assert.equal(hasAnyScore({ scoreL: 0, scoreR: null }), true)
  assert.equal(hasAnyScore({ scoreL: null, scoreR: 0 }), true)
})

test('VRIJ is always complete without counting as manually entered scores', () => {
  for (const match of [
    { teamL: 'A', teamR: 'VRIJ', scoreL: 0, scoreR: 0 },
    { teamL: 'VRIJ', teamR: 'A', scoreL: null, scoreR: null },
  ]) {
    assert.equal(isMatchPlayed(match), true)
    assert.equal(hasAnyScore(match), false)
  }
})

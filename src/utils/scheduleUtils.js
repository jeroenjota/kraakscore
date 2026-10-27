export function swapTeamsInSchedule(rounds, teamA, teamB) {
  for (const round of rounds) {
    for (const match of round) {
      for (const side of ['teamL', 'teamR']) {
        if (match[side] === teamA) {
          match[side] = teamB
        } else if (match[side] === teamB) {
          match[side] = teamA
        }
      }
      const isBye = match.teamL === 'VRIJ' || match.teamR === 'VRIJ'
      match.scoreL = isBye ? 0 : null
      match.scoreR = isBye ? 0 : null
    }
  }
}

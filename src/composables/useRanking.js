import dbService from '../services/dbServices.js'
import { useToast } from 'vue-toastification'

export function useRanking(state) {
  const toast = useToast()
  const { serverAvailable, rankingData, filteredRanking, vanaf, tot } = state

  async function getRanking(msg) {
    if (!serverAvailable.value) return
    try {
      const response = await dbService.fetchRanking()
      rankingData.value = response.data
      if (msg) toast.success(msg, { position: 'top-center', timeout: 2000 })
    } catch (error) {
      console.error('Fout bij het ophalen van ranking:', error)
      toast.error('Fout bij het ophalen van ranking: ' + error.message, {
        position: 'bottom-center',
        timeout: 4000,
      })
    }
  }

  function filterRankingByPeriod() {
    const start = new Date(vanaf.value)
    const end = new Date(tot.value)

    const resultAll = rankingData.value.map((speler) => {
      const filteredScores = speler.scores.filter((s) => {
        const d = new Date(s.datum)
        return d >= start && d <= end
      })
      const beste6 = [...filteredScores]
        .sort((a, b) => b.punten - a.punten)
        .slice(0, 6)
      const totaal = beste6.reduce((sum, s) => sum + s.punten, 0)
      return { speler: speler.speler, scores: filteredScores, totaal }
    })

    const result = resultAll.filter((s) => s.totaal > 0)
    result.sort((a, b) => b.totaal - a.totaal)

    let lastTotaal = null
    let plaats = 0
    let echtePlaats = 0

    const metPlaats = result.map((s) => {
      echtePlaats++
      if (s.totaal !== lastTotaal) {
        plaats = echtePlaats
        lastTotaal = s.totaal
      }
      return { ...s, plaats }
    })

    filteredRanking.value = metPlaats
  }

  return {
    getRanking,
    filterRankingByPeriod,
  }
}

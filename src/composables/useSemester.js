/**
 * useSemester – semester period management composable.
 * A semester spans half a year: semester 1 = Jan–Jun, semester 2 = Jul–Dec.
 * This composable derives the active semester from the tournament date,
 * sets the vanaf/tot date range, and filters tournaments and rankings accordingly.
 */
import { stripTime } from '../utils/dateUtils.js'

export function useSemester(state, { filterRankingByPeriod }) {
  const { currentSemester, vanaf, tot, toernooien, filteredToernooien, thisToernooiDatum } = state

  // Keep only tournaments whose date falls within the vanaf–tot range
  function filterToernooien() {
    filteredToernooien.value = toernooien.value
      .filter((tn) => {
        const date = new Date(stripTime(tn.datum))
        return (
          date >= new Date(stripTime(vanaf.value)) &&
          date <= new Date(stripTime(tot.value))
        )
      })
      .sort((a, b) => new Date(a.datum) - new Date(b.datum))
  }

  // Compute the start and end dates for the current semester and refresh filters
  function setPeriode() {
    const [year, semester] = currentSemester.value.split('-')
    const startMonth = semester === '1' ? '01' : '07'
    vanaf.value = `${year}-${startMonth}-01`
    tot.value = `${year}-${semester === '1' ? '06' : '12'}-31`
    filterToernooien()
    filterRankingByPeriod()
  }

  // Build a sorted list of unique semester strings ("YYYY-S") from all tournaments
  function getSemesters() {
    const uniqueDates = new Set()
    toernooien.value.forEach((tn) => {
      const date = new Date(tn.datum)
      const semester = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 6)}`
      uniqueDates.add(semester)
    })
    return Array.from(uniqueDates).sort()
  }

  // Derive the active semester from the current tournament date (or today) and apply it
  function setActiveSemester() {
    if (thisToernooiDatum.value) {
      const date = new Date(thisToernooiDatum.value)
      currentSemester.value = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 6)}`
    } else {
      currentSemester.value = `${new Date().getFullYear()}-${Math.ceil((new Date().getMonth() + 1) / 6)}`
    }
    setPeriode()
  }

  return {
    filterToernooien,
    setPeriode,
    getSemesters,
    setActiveSemester,
  }
}

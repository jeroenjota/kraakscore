import { stripTime } from '../utils/dateUtils.js'

export function useSemester(state, { filterRankingByPeriod }) {
  const { currentSemester, vanaf, tot, toernooien, filteredToernooien, thisToernooiDatum } = state

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

  function setPeriode() {
    const [year, semester] = currentSemester.value.split('-')
    const startMonth = semester === '1' ? '01' : '07'
    vanaf.value = `${year}-${startMonth}-01`
    tot.value = `${year}-${semester === '1' ? '06' : '12'}-31`
    filterToernooien()
    filterRankingByPeriod()
  }

  function getSemesters() {
    const uniqueDates = new Set()
    toernooien.value.forEach((tn) => {
      const date = new Date(tn.datum)
      const semester = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 6)}`
      uniqueDates.add(semester)
    })
    return Array.from(uniqueDates).sort()
  }

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

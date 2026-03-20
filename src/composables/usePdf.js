/**
 * usePdf – PDF generation composable.
 * Creates a two-page PDF: page 1 is the tournament results (uitslagPDF),
 * page 2 is the semester ranking table (rankingPDF). The generated file
 * is uploaded to the server and then opened in a new browser tab.
 */
import dbService from '../services/dbServices.js'
import { useToast } from 'vue-toastification'
import { uitslagPDF } from '../utils/pdf/tournamentPDF.js'
import { rankingPDF } from '../utils/pdf/rankingPDF.js'
import { getPdfUrl } from '../utils/pdfUtils.js'
import { niceDate } from '../utils/dateUtils.js'
import jsPDF from 'jspdf'

export function usePdf(state, { bevestig, filterToernooien, filterRankingByPeriod }) {
  const toast = useToast()
  const { thisToernooiDatum, groepsToernooi, filteredRanking, filteredToernooien, pdfUrl } = state

  // Build a standardised PDF filename from a date, e.g. "kraken_20_mrt_2026.pdf"
  function getPdfFileName(datum) {
    return `Kraken_${niceDate(datum, true)}.pdf`
      .replace(/\s+/g, '_')
      .toLowerCase()
  }

  /**
   * Generate the tournament PDF (results + ranking), upload it, and open it.
   * If a PDF for the same date already exists the user is asked whether to
   * regenerate or just open the existing one.
   */
  async function maakPdf() {
    const pdfFileName = (`Kraken_${niceDate(thisToernooiDatum.value, true)}.pdf`)
      .replace(/\s+/g, '_')
      .toLowerCase()

    if (await dbService.pdfExists(pdfFileName)) {
      pdfUrl.value = getPdfUrl(thisToernooiDatum.value)
      const ok = await bevestig(
        'Afdruk',
        'De PDF bestaat al. Wil je deze opnieuw aanmaken?',
        'question',
      )
      if (ok) {
        pdfUrl.value = null
      } else {
        dbService.openPDF(pdfFileName)
        return
      }
    }

    filterToernooien()
    filterRankingByPeriod()

    const datum = thisToernooiDatum.value || new Date()
    const doc = new jsPDF()
    uitslagPDF(doc, datum, groepsToernooi.value)
    doc.addPage()
    rankingPDF(doc, filteredRanking.value, filteredToernooien.value, thisToernooiDatum.value)

    const formData = new FormData()
    formData.append('file', doc.output('blob'), pdfFileName)
    try {
      const response = await dbService.uploadPDF(formData)
      if (response.success) {
        toast.success('PDF succesvol opgeslagen op de server!', {
          position: 'top-center',
          timeout: 3000,
        })
      }
    } catch (error) {
      console.error('Fout bij het uploaden van de PDF:', error)
      toast.error('Fout bij het uploaden van de PDF: ' + error.message, {
        position: 'top-center',
        timeout: 5000,
      })
    }

    pdfUrl.value = getPdfUrl(thisToernooiDatum.value)
    dbService.openPDF(pdfFileName)
  }

  return {
    getPdfFileName,
    maakPdf,
  }
}

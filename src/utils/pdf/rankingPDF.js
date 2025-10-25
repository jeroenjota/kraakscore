import autoTable from "jspdf-autotable";
import { niceDate, getSemester } from "../dateUtils";

function toonPlaats(ranking, index) {
  if (index === 0) return ranking[0].plaats
  if (ranking[index].plaats !== ranking[index - 1].plaats) {
    return ranking[index].plaats
  }
  return ''
}

function gespeeld(ranking, index) {
  let gespeeld = 0;
  ranking[index].scores.forEach((res) => {
    if (res.punten !== 0) gespeeld++;
  });
  return gespeeld || 0;
}


export function rankingPDF(doc, ranking, toernooien, datum) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marge = 20;
  let yPos = 10;
  doc.setFont("times");
//  console.log("Ranking PDF wordt aangemaakt", ranking, "Aantal toernooien:", toernooien.length, "Datum:", datum);
  const formattedDate = niceDate(datum, true);
//  // console.log("Datum voor PDF:", formattedDate, datum);
  doc.setFontSize(18);
  doc.text("Laurierboom Kraaktoernooi", pageWidth / 2, yPos += 2, { align: "center" });
  doc.setFontSize(16);
  let txt = "Ranking " + getSemester(datum, true);
  if (toernooien.length > 0) {
    txt += ` na ${toernooien.length} toernooien`;
  } else {
    txt += " (geen toernooien)";
  }

  doc.text(`${txt}`, pageWidth / 2, yPos += 8, { align: "center" });
  doc.setFontSize(10);
  doc.line(marge, 35, pageWidth - marge, 35);
  autoTable(doc, {
    head: [["Pl", "Speler", "Gesp", ...toernooien.map(t => niceDate(t.datum)), "Beste 6"]],
    body: ranking.map((r, index) => [
      toonPlaats(ranking , index),
      r.speler,
      gespeeld(ranking, index),
      ...toernooien.map(t => r.scores.find(s => s.datum === t.datum)?.punten || "-"),
      r.totaal || "-"
    ]),
    theme: "striped",
    startY: yPos += 5,
    headStyles: {
      fillColor: [0, 100, 139],
      fontSize: 12,
      textColor: [255, 255, 255],
      halign: "center",
      valign: "bottom"
    },
    styles: { font: "times", fontSize: 10, halign: "center", cellWidth: "auto" },

    columnStyles: {
      1: { cellWidth: 25, halign: "left", valign: "middle" },
    },
    didParseCell: function (data) {
      // For the header row, column index 1 = "Speler"
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.halign = 'left';
      }
      if (data.section === 'body' && (data.column.index === 1 || data.column.index === 0 || data.column.index === data.table.columns.length - 1)) {
        data.cell.styles.fontSize = 14;
        const colIndex = data.column.index;
        const rowIndex = data.row.index;

        // Eerste rij altijd vet (plaats 1)
        const highScore = ranking[0]?.totaal; 
        const currentTotaal = ranking[rowIndex]?.totaal;
        const prevTotaal = highScore
        const isTopRow = rowIndex === 0;
        const sameAsAbove = currentTotaal === prevTotaal;

        const isNameCol = colIndex === 1;
        const isTotaalCol = colIndex === data.table.columns.length - 1;

        if ((isTopRow || sameAsAbove) && (isNameCol || isTotaalCol)) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });
  // centreer de tekst onder de tabel
  yPos = doc.lastAutoTable.finalY + 10;
  doc.line(marge, yPos, pageWidth - marge, yPos);
  yPos += 5;
  doc.setFontSize(12);
  const rnkTxt = "Ranking scores: 1e plaats 12, 2e plaats 9, 3e plaats 6, 4e plaats 3, meedoen 1 pnt"

  doc.text(`${rnkTxt} \n(maximaal de beste 6 resultaten)`, pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
  doc.line(marge, yPos, pageWidth - marge, yPos);
  // yPos = doc.lastAutoTable.finalY + 2;
  // const blobPDF = doc.output("blob");
  // window.open(URL.createObjectURL(blobPDF));
  // const fileName = `Ranking_${datum}.pdf`;
  // doc.save(fileName);
  // doc.output("dataurlnewwindow");
  // footer
  let savFntSize = doc.fontSize
  doc.setFontSize(8)
  doc.text(`©2025 jota services`, pageWidth / 2, 290, { align: "center" });
  doc.setFontSize(savFntSize)
} 

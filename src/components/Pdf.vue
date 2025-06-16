// VEREIST: npm install jspdf jspdf-autotable // localStorage voorbeeld localStorage.setItem('matches', JSON.stringify([
{ team1: 'Team A', team2: 'Team B', score1: 2, score2: 1 }, { team1: 'Team C', team2: 'Team D', score1: 0, score2: 0 }
]))

<template>
  <div class="p-4">
    <button @click="exportPdf" class="bg-blue-500 text-white px-4 py-2 rounded">Uitslag afdrukken</button>
  </div>
</template>

<script setup>
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Ophalen en parsen van data uit localStorage
function getMatchesFromStorage() {
  const raw = localStorage.getItem("schedule");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Fout bij parsen van localStorage:", e);
    return [];
  }
}

function exportPdf() {
  const matches = getMatchesFromStorage();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const head = ["Ronde", "Tafel", "Match", "Uitslag", "tegen"];
  doc.setFontSize(24);
  const datum = new Date().toLocaleDateString("nl-NL");
  doc.text("Overzicht kraaktoernooi van " + datum, pageWidth/2, 20, { align:'center'});
  doc.line(14, 22, pageWidth-14, 22);
  doc.setFontSize(12);
  let yPos = 20;
  let table = new Array();
  if (matches.length === 0) {
    doc.text("Geen data gevonden in localStorage.", 14, (yPos += 8));
  } else {
    doc.setFontSize(18);
    doc.text("Stand ", pageWidth/2, (yPos += 12), {align:'center'});
    autoTable(doc, {
      theme: "striped",
      startY: (yPos += 2),
      html: "#standTabel",
      columnStyles: { 3: { halign: "center" } },
      tableWidth: 100,
      margin: { left:(pageWidth- 100)/2 },
    });
    yPos += doc.lastAutoTable.finalY - 26;
    doc.line(14, yPos-6, pageWidth-14, yPos-6);
    doc.text("Ronde uitslagen", pageWidth/2, yPos, {align:'center'});
    matches.forEach((m, index) => {
      // doc.text(`Ronde ${index+1}`, 14, yPos+=8)
      if (m[0].homeScore || m[0].awayScore) {
        table = [];
        m.forEach((t, idx) => {
          if (t.homeScore || t.awayScore) {
            let obj = [index + 1, idx + 1, t.home + " vs " + t.away, String(t.homeScore), String(t.awayScore)];
            table.push(obj);
          }
        });
        autoTable(doc, {
          theme: "grid",
          head: [head],

          startY: (yPos += 2),
          columnStyles: { 
            0: { row}
            3: { halign: "center" }, 
            4: { halign: "center" } },
          tableWidth: 140,
          body: table,
          margin: { left:(pageWidth- 140)/2 },
        });
        yPos += 30;
      }
    });
  }

  doc.save("kraaktoernooi.pdf");
}
</script>

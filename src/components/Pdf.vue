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
  // var img = new Image();
  // img.src = "../assets/raam.jpg";
  // console.log(img.src);
  // doc.addImage(img, "jpeg", 0, 0, 12, 15);
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const head = ["Ronde", "Tafel", "Match", "Uitslag", "tegen"];
  doc.setFont("times");
  doc.setFontSize(24);
  const datum = new Date().toLocaleDateString("nl-NL");
  doc.text("Overzicht kraaktoernooi van " + datum, pageWidth / 2, 20, { align: "center" });
  doc.line(14, 22, pageWidth - 14, 22);
  doc.setFontSize(12);
  let yPos = 20;
  let table = new Array();
  if (matches.length === 0) {
    doc.text("Geen data gevonden in localStorage.", 14, (yPos += 8));
  } else {
    doc.setFontSize(18);
    doc.text("Stand ", pageWidth / 2, (yPos += 12), { align: "center" });
    autoTable(doc, {
      theme: "striped",
      styles: { font: "times", fontSize: 14 },
      startY: (yPos += 2),
      headStyles: { fillColor: [158, 207, 240], textColor: [0, 0, 139] },
      html: "#standTabel",
      columnStyles: { 3: { halign: "center" } },
      tableWidth: 90,
      tableLineWidth: 1,
      margin: { left: (pageWidth - 90) / 2 },
    });
    yPos += doc.lastAutoTable.finalY - 26;
    doc.line(14, yPos - 6, pageWidth - 14, yPos - 6);
    doc.text("Ronde uitslagen", pageWidth / 2, yPos, { align: "center" });
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
          tableLineWidth: 1,
          head: [head],
          headStyles: { fillColor: [0, 100, 139] },
          styles: { font: "times" },
          startY: (yPos += 2),
          columnStyles: {
            3: { halign: "center" },
            4: { halign: "center" },
          },
          tableWidth: 120,
          body: table,
          margin: { left: (pageWidth - 120) / 2 },
        });
        yPos += 30;
      } else {
        doc.setFontSize(14);
        doc.text(`Ronde ${(index+1)}: Nog geen uitslagen ingevoerd`, pageWidth / 2, yPos+=20, { align: "center" });
      }
    });
  }

  doc.save("kraaktoernooi.pdf");
}
</script>

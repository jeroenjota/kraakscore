// VEREIST: npm install jspdf jspdf-autotable // localStorage voorbeeld localStorage.setItem('matches', JSON.stringify([
{ team1: 'Team A', team2: 'Team B', score1: 2, score2: 1 }, { team1: 'Team C', team2: 'Team D', score1: 0, score2: 0 }
]))

<template>
  <div>
    <button @click="exportPdf" class="bg-green-500 text-white px-2 rounded mt-2"
      style="margin-left:2px; width:auto; height:30px; font-size: .9em;">Afdrukken</button>
  </div>
</template>

<script setup>
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ref } from "vue";
import raam from '../assets/raam.jpg'


// import imgRaam from '../assets/raam.jpg'
// import imgCafe from '../assets/cafe.jpg'
let gesplitst = false
const rounds = ref([]);
const matches = ref([]);
const groups = ref([]);
const groupMatches = ref([]);
const finalMatches = ref([
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // finale
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // 3e plaats
]);


// Ophalen en parsen van data uit localStorage
function getMatchesFromStorage() {
  const teams = JSON.parse(localStorage.getItem("teams"));
  gesplitst = teams.length >= 8
  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
  if (gesplitst) {
    groups.value = JSON.parse(g);
    //  console.log("Opgehaald: groepen:", groups.value)
    groupMatches.value = JSON.parse(gm);
    //  console.log("Opgehaald: gro upMatches:", matches.value)
  } else {
    //  console.log("Single toernooi")
    rounds.value = JSON.parse(m);
    //  console.log("Opgehaald: matches:", rounds.value)
  }
  if (fm) {
    finalMatches.value = JSON.parse(fm);
    //  console.log("finales:", finalMatches.value)
  }
}

function finalBekend() {
  const isBekend = finalMatches.value.length === 2 && finalMatches.value[0].teamL && finalMatches.value[0].teamR && finalMatches.value[1].teamL && finalMatches.value[1].teamR
  console.log("Bekend: ", isBekend, finalMatches.value[0].teamL , finalMatches.value[0].teamR)
  return isBekend
}

function finalPlayed() {
  const isPlayed = (finalMatches.value[0].scoreL || finalMatches.value[0].scoreR) && (finalMatches.value[1].scoreLL || finalMatches.value[1].scoreR)
  console.log("Played: ", isPlayed)
  return isPlayed
}


function exportPdf() {
  getMatchesFromStorage();
  const doc = new jsPDF();
  let countPlayed = 0
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

  const head = ["ronde", "match", "score"];
  let yPos = 14;
  let nextYpos = 0
  doc.setFont("times");
  doc.setFontSize(18);
  const datum = new Date().toLocaleDateString("nl-NL");
  // doc.setTextColor("#ffffff")
  doc.text("Overzicht kraaktoernooi van " + datum, pageWidth / 2, yPos, { align: "center" });
  yPos += 2
  doc.line(14, yPos, pageWidth - 14, yPos);
  let table = new Array();
  if (!gesplitst) {
    // single Tournooi
    // doc.line(14, yPos - 6, pageWidth - 14, yPos - 6);
    doc.text("Ronde uitslagen", pageWidth / 2, yPos += 6, { align: "center" });
    rounds.value.forEach((r, index) => {
      yPos += 4
      table = [];
      r.forEach((match, idx) => {
        let obj = []
        if (match.scoreL || match.scoreR) {
          obj = [`Tafel ${(idx + 1)}`, match.teamL + " vs " + match.teamR, `${match.scoreL} - ${match.scoreR}`];
        } else {
          obj = [`Tafel ${(idx + 1)}`, match.teamL + " vs " + match.teamR, ""];
        }
        table.push(obj);
        countPlayed += 1

      });
      head[0] = `ronde ${(index + 1)}`
      autoTable(doc, {
        theme: "grid",
        tableLineWidth: 1,
        head: [head],
        headStyles: { fillColor: [0, 100, 139] },
        styles: { font: "times" },
        startY: yPos,
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "right" },
        },
        tableWidth: 120,
        body: table,
        margin: { left: (pageWidth - 120) / 2 },
      })
      yPos += table.length * 9 + 1;
    });
    yPos += 4
    doc.line(14, yPos, pageWidth - 14, yPos);
    doc.setFontSize(18);
    doc.text(`Stand`, pageWidth / 2, (yPos += 8), { align: "center" });
    doc.setFontSize(12);
    autoTable(doc, {
      theme: "striped",
      styles: { font: "times", fontSize: 14 },
      startY: (yPos += 2),
      headStyles: { fillColor: [158, 207, 240], textColor: [0, 0, 139] },
      html: "#standTabel",
      columnStyles: { 3: { halign: "center" } },
      tableWidth: 120,
      tableLineWidth: 1,
      margin: { left: (pageWidth - 120) / 2 },
    });

  } else {
    // GroupTournooi()
    // eerst de standen in de groepen

    groupMatches.value.forEach((gm, index) => {
      const xPos = 12 + (pageWidth / 2 - 12) * index
      doc.setFontSize(18);
      yPos = 24
      doc.text(`Groep ${(index + 1)}`, xPos, yPos)
      gm.forEach((round, idx) => {
        table = [];
        round.forEach((match, idx) => {
          //  console.log("Match:" , match)
          let obj = []
          if (match.scoreL || match.scoreR) {
            obj = [`T${(idx + 1)}`, match.teamL + " vs " + match.teamR, `${match.scoreL} - ${match.scoreR}`];
          } else {
            obj = [`T ${(idx + 1)}`, match.teamL + " vs " + match.teamR, ""];
          }
          table.push(obj);

        });
        //  console.log("Breedte: ", pageWidth)
        head[0] = `R${(idx + 1)}`
        autoTable(doc, {
          theme: "grid",
          tableLineWidth: 1,
          head: [head],
          headStyles: {
            fillColor: [0, 100, 139],
          },
          styles: { font: "times" },
          startY: (yPos += 2),
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 57 },
            2: { halign: "center", cellWidth: 25 },
          },
          tableWidth: pageWidth / 2 - 15,  // 90mm
          body: table,
          margin: { left: xPos },
        });
        yPos += table.length * 10 + 4;
      })
      // groeps standen
      yPos += 4
      doc.line(14, yPos, pageWidth - 14, yPos);
      doc.setFontSize(18);
      doc.text(`Tussentand`, pageWidth / 2, (yPos += 8), { align: "center" });
      doc.setFontSize(12);
      autoTable(doc, {
        theme: "striped",
        styles: { font: "times", fontSize: 14 },
        startY: (yPos += 2),
        headStyles: { fillColor: [158, 207, 240], textColor: [0, 0, 139] },
        html: "#standTabel" + String.fromCharCode(65 + index),
        columnStyles: { 3: { halign: "center" } },
        tableWidth: pageWidth / 2 - 16,
        tableLineWidth: 1,
        margin: { left: xPos },
      });
    })
    // finales
    if (finalBekend()) {
      yPos = doc.lastAutoTable.finalY + 4
      let xPos = (pageWidth - 120) / 2
      doc.line(14, yPos, pageWidth - 14, yPos);
      doc.setFontSize(18);
      doc.text(`Finale`, pageWidth / 2, (yPos += 8), { align: "center" });
      doc.setFontSize(12);
      table = []
      let obj = []
      let uitslag = []
      for (let i = 0; i < 2; i++) {
        let finMatch = finalMatches.value[i]
        if (finMatch.scoreL > finMatch.scoreR) {
          uitslag.push(finMatch.teamL)
          uitslag.push(finMatch.teamR)
        } else {
          uitslag.push(finMatch.teamR)
          uitslag.push(finMatch.teamL)
        }
        obj = [`Finale:`, finMatch.teamL + " vs " + finMatch.teamR, `${finMatch.scoreL} - ${finMatch.scoreR}`];
        if (i > 0) {
          obj = [`3e Plaats:`, finMatch.teamL + " vs " + finMatch.teamR, `${finMatch.scoreL} - ${finMatch.scoreR}`];
        }
        table.push(obj)
      }
      const finhead = ["match", "spelers", "uitslag"];
      autoTable(doc, {
        head: [finhead],
        theme: "striped",
        styles: { font: "times", fontSize: 14 },
        startY: (yPos += 2),
        headStyles: { fillColor: [5, 93, 165], textColor: [255, 255, 255] }, columnStyles: { 3: { halign: "center" } },
        tableWidth: 120,
        tableLineWidth: 1,
        body: table,
        margin: { left: xPos },
      });
      yPos = doc.lastAutoTable.finalY

      // uitslag
      if (finalPlayed()) {
        doc.setFontSize(18);
        doc.text(``, pageWidth / 2, (yPos += 8), { align: "center" });
        table = []
        uitslag.forEach((team, index) => {
          obj = [`${(index + 1)}e plaats`, team]
          if (index === 0) {
            obj = ['Winnaars:', team]
          }
          table.push(obj)
          // doc.text(`${(index +1)}: ${team}`, pageWidth / 2-20, (yPos += 12), { align: "left" });
        })
        xPos = (pageWidth - 80) / 2
        autoTable(doc, {
          head: [["Eindstand", "Team"]],
          theme: "plain",
          styles: { font: "times", fontSize: 14 },
          startY: (yPos += 2),
          headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 139] },
          tableWidth: 80,
          tableLineWidth: 1,
          body: table,
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 45 },
          },
          margin: { left: xPos },
          bodyStyles: {
            valign: 'middle',
          },
          didParseCell: function (data) {
            if (data.section === "body" && data.row.index === 0) {
              if (data.column.index === 1) {
                data.cell.styles.fontSize = 18;
              }
            }

            if ((data.row.section === 'head' || data.row.section === 'foot') && data.column.dataKey === "expenses") {
              data.cell.text = '' // Use an icon in didDrawCell instead
            }

            if (data.row.index === 0 && data.row.section === 'body' && data.column.dataKey === 'city') {
              data.cell.text = 'とうきょう'
            }
          },

        })

      }
      // var img = new Image();
      // img.src = "raam"
      // doc.addImage(img, 'jpg', xPos, 20, 80, 40)
    }
  }
  doc.save("kraaktoernooi.pdf");
}


</script>

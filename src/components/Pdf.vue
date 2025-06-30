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

import imgRaam from '../assets/raam.jpg'
import imgBoom from '../assets/laurierboom.jpeg'
import imgCafe from '../assets/cafe.jpg'
import imgKraak from '../assets/kraken.jpeg'  // kraken
import imgKaarten from '../assets/kaarten.png'
import imgBeker from '../assets/beker.jpg'

// let imgRaam = new Image()
// imgRaam.src = img1
// let imgBoom = new Image()
// imgBoom.src = img2
// let imgCafe = new Image()
// imgCafe.src = img3
// let imgKraak = new Image()
// imgKraak.src = img4

let gesplitst = false
const rounds = ref([]);
const matches = ref([]);
const groups = ref([]);
const groupMatches = ref([]);
const finalMatches = ref([
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // finale
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // 3e plaats
]);

const props = defineProps({
  groepsToernooi: {
    type: Boolean,
    default: false
  },
})
// Ophalen en parsen van data uit localStorage
function getMatchesFromStorage() {
  const teams = JSON.parse(localStorage.getItem("teams"));
  gesplitst = props.groepsToernooi
//  console.log("gesplistst", gesplitst)
  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
  if (gesplitst) {
    groups.value = JSON.parse(g);
//    //  console.log("Opgehaald: groepen:", groups.value)
    groupMatches.value = JSON.parse(gm);
//    //  console.log("Opgehaald: gro upMatches:", matches.value)
  } else {
//    //  console.log("Single toernooi")
    rounds.value = JSON.parse(m);
//    //  console.log("Opgehaald: matches:", rounds.value)
  }
  if (fm) {
    finalMatches.value = JSON.parse(fm);
//    //  console.log("finales:", finalMatches.value)
  }
}

function finalBekend() {
  const isBekend = finalMatches.value.length === 2 && finalMatches.value[0].teamL && finalMatches.value[0].teamR && finalMatches.value[1].teamL && finalMatches.value[1].teamR
//  console.log("Bekend: ", isBekend, finalMatches.value[0].teamL, finalMatches.value[0].teamR)
  return isBekend
}

function finalPlayed() {
  const isPlayed = (finalMatches.value[0].scoreL || finalMatches.value[0].scoreR) && (finalMatches.value[1].scoreLL || finalMatches.value[1].scoreR)
//  console.log("Played: ", isPlayed)
  return isPlayed
}


function exportPdf() {
  getMatchesFromStorage();
  const doc = new jsPDF();
  let countPlayed = 0;
  let countRondeMatch = 0;
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const tblWidth = 90
  const marge = 12
  const head = ["ronde", "match", "score"];
  let yPos = marge;
  let saveY = 0
  doc.setFont("times");
  doc.setFontSize(18);
  const datum = new Date().toLocaleDateString("nl-NL");
  doc.addImage(imgRaam, 'jpeg', marge, marge - 6, 35, 18)
  doc.addImage(imgKraak, 'jpeg', pageWidth - marge - 35, marge - 6, 35, 18)
  doc.text("Overzicht kraaktoernooi van " + datum, pageWidth / 2, yPos, { align: "center" });
  yPos += 2
  doc.line(marge + 40, yPos, pageWidth - marge - 40, yPos);
  let table = new Array();
  if (!gesplitst) {
    // single Tournooi
    // doc.line(14, yPos - 6, pageWidth - 14, yPos - 6);
    doc.text("Ronde uitslagen", pageWidth / 2, yPos += 8, { align: "center" });
    yPos += 4
    saveY = yPos
    let xPos = marge
    countRondeMatch = rounds.value.length * rounds.value[0].length
    rounds.value.forEach((r, index) => {
      xPos = marge
      if (index % 2 !== 0) {
        xPos = pageWidth / 2 + marge / 2
        yPos = saveY
      } else {

      }
      // laatste tabel centreren als er een oneven aantal rondes is
      if (index === rounds.value.length - 1 && rounds.value.length % 2 !== 0) {
//        console.log("Index", index, xPos)
        xPos = (pageWidth - tblWidth) / 2
//        console.log("Index", index, xPos)
        doc.addImage(imgCafe, 'jpeg', marge, yPos, 40, 30)
        doc.addImage(imgBoom, 'jpeg', pageWidth - marge - 30, yPos, 30, 30)
      }
      // plaatjes toevoegen
      // bouw de ronde score tabel
      table = [];
      r.forEach((match, idx) => {
        let obj = []
        if ((match.scoreL || match.scoreR) || match.teamR === 'VRIJ') {
          obj = [`Tafel ${(idx + 1)}`, match.teamL + " vs " + match.teamR, `${match.scoreL} - ${match.scoreR}`];
          countPlayed += 1
        } else {
          obj = [`Tafel ${(idx + 1)}`, match.teamL + " vs " + match.teamR, ""];
        }
        table.push(obj);
      });
      head[0] = `ronde ${(index + 1)}`
//      console.log(`Ronde: ${(index + 1)}, yPos: ${yPos}`)
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
        tableWidth: 90,
        body: table,
        margin: { left: xPos },
      })
      if (index % 2 !== 0) {
        yPos += (table.length + 1) * 8
        saveY = yPos
      }
    });
    xPos = marge
    yPos = doc.lastAutoTable.finalY + 2
    doc.line(marge, yPos, pageWidth - marge, yPos);
    doc.setFontSize(18);
    let kopTxt = "Tussenstand"
    if (countRondeMatch === countPlayed) {
      kopTxt = "Eindstand"
      doc.addImage(imgBeker, 'jpeg', marge, yPos+8, 40,50)
      doc.addImage(imgKaarten, 'jpeg', pageWidth-40-marge, yPos+8, 40,50)

    }

    doc.text(kopTxt, pageWidth / 2, (yPos += 8), { align: "center" });
    doc.setFontSize(12);
    autoTable(doc, {
      theme: "striped",
      styles: { font: "times", fontSize: 14 },
      startY: (yPos += 2),
      headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 139] },
      html: "#standTabel",
      columnStyles: { 2: { halign: "center" } },
      tableWidth: tblWidth,
      tableLineWidth: 1,
      margin: { left: (pageWidth - tblWidth) / 2 },
      didParseCell: function (data) {
        if (countRondeMatch === countPlayed) {
          if (data.section === "body" && data.row.index === 0) {
            if (data.column.index === 1) {
              data.cell.styles.fontSize = 20;
            }
          }
          if (data.section === "body" && data.row.index === 1) {
            if (data.column.index === 1) {
              data.cell.styles.fontSize = 18;
            }
          }
          if (data.section === "body" && data.row.index === 2) {
            if (data.column.index === 1) {
              data.cell.styles.fontSize = 16;
            }
          }
        }
      },
    });
    // yPos = doc.lastAutoTable.finalY 
    // if (yPos < 200) doc.addImage(imgCafe, 'jpeg', (pageWidth - tblWidth) / 2, yPos, tblWidth, 280 - yPos)

  } else {
    // GroupTournooi()
    // eerst de standen in de groepen
    saveY = yPos
    let kopPosY = 0
    let kopTxt = ""
    countRondeMatch = groupMatches.value.length * groupMatches.value[0].length * groupMatches.value[0][0].length
    groupMatches.value.forEach((gm, index) => {
      const xPos = marge + (pageWidth / 2 - marge) * index
      doc.setFontSize(18);
      yPos = marge * 2.5
      doc.text(`Groep ${(index + 1)}`, xPos, yPos)
      yPos += 2
      gm.forEach((round, idx) => {
        table = [];
        round.forEach((match, idx) => {
//          //  console.log("Match:" , match)
          let obj = []
          if ((match.scoreL || match.scoreR) || match.teamR === 'VRIJ') {
            obj = [`T${(match.tafel)}`, match.teamL + " vs " + match.teamR, `${match.scoreL} - ${match.scoreR}`];
            countPlayed += 1
          } else {
            obj = [`T${(match.tafel)}`, match.teamL + " vs " + match.teamR, ""];
          }
          table.push(obj);
        });
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
          tableWidth: tblWidth,  // 90mm
          body: table,
          margin: { left: xPos },
        });
        yPos += table.length * 10 + 4;
      })
      // groeps standen
      yPos += 2
      doc.line(marge, yPos, pageWidth - marge, yPos);
      doc.setFontSize(18);
      kopPosY = yPos += 8
      kopTxt = "Tussenstand groepen"
      if (countRondeMatch === countPlayed) kopTxt = "Eindstand groepen"
      doc.setFontSize(12);
      autoTable(doc, {
        theme: "striped",
        styles: { font: "times", fontSize: 14 },
        startY: (yPos += 2),
        headStyles: { fillColor: [158, 207, 240], textColor: [0, 0, 139] },
        html: "#standTabel" + String.fromCharCode(65 + index),
        columnStyles: { 3: { halign: "center" } },
        tableWidth: tblWidth,
        tableLineWidth: 1,
        margin: { left: xPos },
      });

      if (saveY < doc.lastAutoTable.finalY + 4) saveY = doc.lastAutoTable.finalY + 4
    })
    doc.setFontSize(18)
    doc.text(kopTxt, pageWidth / 2, (kopPosY), { align: "center" });
    doc.setFontSize(12)
    // finales
    if (finalBekend()) {
      yPos = saveY
      let xPos = (pageWidth - tblWidth - 30) / 2
      doc.line(marge, yPos, pageWidth - marge, yPos);
      doc.setFontSize(18);
      doc.text(`Finales`, pageWidth / 2, (yPos += 8), { align: "center" });
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
        obj = [`Finale:`, finMatch.teamL + " vs " + finMatch.teamR, `${finMatch.scoreL || ""} - ${finMatch.scoreR || ""}`];
        if (i > 0) {
          obj = [`3e Plaats:`, finMatch.teamL + " vs " + finMatch.teamR, `${finMatch.scoreL || ""} - ${finMatch.scoreR || ""}`];
        }
        table.push(obj)
      }
      const finhead = ["match", "spelers", "uitslag"];
      yPos += 2
      autoTable(doc, {
        head: [finhead],
        theme: "striped",
        styles: { font: "times", fontSize: 14 },
        startY: yPos,
        headStyles: { fillColor: [5, 93, 165], textColor: [255, 255, 255] }, columnStyles: { 3: { halign: "center" } },
        tableWidth: tblWidth + 30,
        tableLineWidth: 1,
        body: table,
        margin: { left: xPos },
      });
      yPos = doc.lastAutoTable.finalY
      // uitslag
      if (finalPlayed()) {
        yPos += 4
        doc.line(marge, yPos, pageWidth - marge, yPos);
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
        xPos = (pageWidth - tblWidth) / 2
        yPos += 2
        autoTable(doc, {
          head: [["Eindstand", "Team"]],
          theme: "plain",
          styles: { font: "times", fontSize: 14 },
          startY: yPos,
          headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 139] },
          tableWidth: tblWidth,
          tableLineWidth: 1,
          body: table,
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 55 },
          },
          margin: { left: xPos },
          bodyStyles: {
            valign: 'middle',
          },
          didParseCell: function (data) {
            if (data.section === "body" && data.row.index === 0) {
              if (data.column.index === 1) {
                data.cell.styles.fontSize = 20;
              }
            }
            if (data.section === "body" && data.row.index === 1) {
              if (data.column.index === 1) {
                data.cell.styles.fontSize = 18;
              }
            }
            if (data.section === "body" && data.row.index === 2) {
              if (data.column.index === 1) {
                data.cell.styles.fontSize = 16;
              }
            }
          },
        })
        doc.addImage(imgBeker, 'jpeg', marge, yPos, xPos - marge - 4, doc.lastAutoTable.finalY - yPos)
        doc.addImage(imgKaarten, 'jpeg', xPos + tblWidth + 4, yPos, xPos - marge - 4, doc.lastAutoTable.finalY - yPos)

      }
      // var img = new Image();
      // img.src = "raam"
      // doc.addImage(img, 'jpg', xPos, 20, 80, 40)
    }
  }
  // footer
  let savFntSize = doc.fontSize
  doc.setFontSize(8)
  doc.text(`©2025 jota services`, pageWidth / 2, 290, { align: "center" });
  doc.setFontSize(savFntSize)
  doc.save("kraaktoernooi.pdf");
}


</script>

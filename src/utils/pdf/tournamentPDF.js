import { autoTable } from "jspdf-autotable";

import imgRaam from '../../assets/raam.jpg'
import { ref } from 'vue'
import imgBoom from '../../assets/laurierboom.jpeg'
import imgCafe from '../../assets/cafe.jpg'
import imgKraak from '../../assets/kraken.jpeg'  // kraken
import imgKaarten from '../../assets/kaarten.png'
import imgBeker from '../../assets/beker.jpg'


import { niceDate } from "../dateUtils";


let gesplitst = false
const rounds = ref([]);
const teams = ref([]);
const groups = ref([]);
const groupMatches = ref([]);
const finalMatches = ref([
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // finale
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // 3e plaats
]);


// Ophalen en parsen van data uit localStorage
function getMatchesFromStorage() {
//  // console.log("getMatchesFromStorage")
  teams.value = JSON.parse(localStorage.getItem("tournamentTeams"));
//  //  console.log("gesplistst", gesplitst)
  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
//  // console.log( "gesplitst:", gesplitst, "g:", g, "gm:", gm, "m:", m, "fm:", fm)
  if (gesplitst) {
    groups.value = JSON.parse(g);
    groupMatches.value = JSON.parse(gm);
  } else {
    rounds.value = JSON.parse(m);
//    //  console.log("Opgehaald: matches:", rounds.value)
  }
  if (fm) {
    finalMatches.value = JSON.parse(fm);
//    //  console.log("finales:", finalMatches.value)
  }
}

function gespeeld(index) {
  let gespeeld = 0;
  ranking.value[index].scores.forEach((res) => {
    if (res.punten !== 0) gespeeld++;
  });
  return gespeeld || 0;
}

function finalBekend() {
  const isBekend = finalMatches.value.length >= 2 && finalMatches.value[0].teamL && finalMatches.value[0].teamR && finalMatches.value[1].teamL && finalMatches.value[1].teamR
//  // console.log("Bekend: ", isBekend, finalMatches.value[0].teamL, finalMatches.value[0].teamR)
  return isBekend
}

function finalPlayed() {
  const isPlayed = (finalMatches.value[0].scoreL || finalMatches.value[0].scoreR) && (finalMatches.value[1].scoreLL || finalMatches.value[1].scoreR)
//  // console.log("Played: ", isPlayed)
  return isPlayed
}

export async function uitslagPDF(doc, datum, groepstoernooi = false) {
  gesplitst = groepstoernooi
  getMatchesFromStorage();
//  // console.log("Gesplitst Na:", gesplitst)
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
  const datumTxt = niceDate(datum, true);
  doc.addImage(imgRaam, 'jpeg', marge, marge - 6, 30, 18)
  doc.addImage(imgKraak, 'jpeg', pageWidth - marge - 30, marge - 6, 30, 18)
  doc.text("Kraaktoernooi van " + datumTxt, pageWidth / 2, yPos, { align: "center" });
  yPos += 2
  doc.line(marge + 40, yPos, pageWidth - marge - 40, yPos);
  yPos += 6
  let infoStr = "";
  if (teams.value) {
    infoStr = `${teams.value.length} teams`;
  } else {
    infoStr = `0 teams`;
  }
  if (gesplitst) {
    infoStr += `, ${groups.value.length} groepen`;
  } else {
    infoStr += `, ${rounds.value.length} rondes`;
  }
  doc.text(infoStr, pageWidth / 2, yPos, { align: "center" });
  let table = new Array();
  if (!gesplitst) {  
    // geen groepstoernooi
    // doc.line(14, yPos - 6, pageWidth - 14, yPos - 6);
    // doc.text("Ronde uitslagen", pageWidth / 2, yPos += 8, { align: "center" });
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
        xPos = (pageWidth - tblWidth) / 2
      // plaatjes toevoegen
        doc.addImage(imgCafe, 'jpeg', marge, yPos, 40, 30)
        doc.addImage(imgBoom, 'jpeg', pageWidth - marge - 30, yPos, 30, 30)
      }
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
      // console.log(`Ronde: ${(index + 1)}, yPos: ${yPos}`)
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
      doc.addImage(imgBeker, 'jpeg', marge, yPos + 8, 40, 50)
      doc.addImage(imgKaarten, 'jpeg', pageWidth - 40 - marge, yPos + 8, 40, 50)
    }
    doc.text(kopTxt, pageWidth / 2, (yPos += 8), { align: "center" });
    doc.setFontSize(12);
    autoTable(doc, {
      theme: "striped",
      styles: { font: "times", fontSize: 12 },
      startY: (yPos += 2),
      headStyles: { fillColor: [0, 128, 0], textColor: [242, 255, 204]  },
      html: "#standTabel",
      columnStyles: {0: { halign: "center", valign: "middle" }, 2: { halign: "center", valign: "middle" }, 3: {halign: "center", valign: "middle" }, 4: {halign: "center", valign: "middle" , fontSize:12}  },
      tableWidth: tblWidth+15,
      tableLineWidth: 1,
      margin: { left: (pageWidth - tblWidth-10) / 2 },
      didParseCell: function (data) {
        if (data.section === "head") {
          data.cell.styles.halign = "center";
          data.cell.styles.fontSize = 12;
          if (data.column.index === 1) {
            data.cell.styles.halign = "left";
          }
        }
        if (countRondeMatch === countPlayed) {
          if (data.section === "body" && data.row.index === 0) {
            if (data.column.index === 1 || data.column.index === 3) {
              data.cell.styles.fontSize = 20;
            }
          }
          if (data.section === "body" && data.row.index === 1) {
            if (data.column.index === 1 || data.column.index === 3) {
              data.cell.styles.fontSize = 18;
            }
          }
          if (data.section === "body" && data.row.index === 2) {
            if (data.column.index === 1 || data.column.index === 3) {
              data.cell.styles.fontSize = 16;
            }
          }
          if (data.section === "body" && data.row.index === 3) {
            if (data.column.index === 1 || data.column.index === 3) {
              data.cell.styles.fontSize = 14;
            }
          }
        }
      },
    });

  } else {
    // GroupTournooi
    // eerst de standen in de groepen
    saveY = yPos
    let kopPosY = 0
    let kopTxt = ""
    countRondeMatch = groupMatches.value.length * groupMatches.value[0].length * groupMatches.value[0][0].length
    groupMatches.value.forEach((gm, index) => {
      const xPos = marge + (pageWidth / 2 - marge) * index
      doc.setFontSize(16);
      yPos = marge * 2.5
      doc.text(`Groep ${(index + 1)}`, xPos, yPos)
      yPos += 1
      gm.forEach((round, idx) => {
        table = [];
        round.forEach((match, idx) => {
//          //          //  console.log("Match:" , match)
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
      yPos += 1
      doc.line(marge, yPos, pageWidth - marge, yPos);
      doc.setFontSize(16);
      kopPosY = yPos += 5
      kopTxt = "Tussenstand groepen"
      if (countRondeMatch === countPlayed) kopTxt = "Eindstand groepen"
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

      if (saveY < doc.lastAutoTable.finalY + 4) saveY = doc.lastAutoTable.finalY + 2
    })
    doc.setFontSize(16)
    doc.text(kopTxt, pageWidth / 2, (kopPosY), { align: "center" });
    doc.setFontSize(12);
    doc.setFontSize(12)
    // finales
    if (finalBekend()) {
      yPos = doc.lastAutoTable.finalY + 2
      let xPos = (pageWidth - tblWidth - 30) / 2
      doc.line(marge, yPos, pageWidth - marge, yPos);
      doc.setFontSize(16);
      doc.text(`Finales`, pageWidth / 2, (yPos += 5), { align: "center" });
      doc.setFontSize(12);
      table = []
      let obj = []
      let uitslag = []
      for (let i = 0; i < 4; i++) {
        let finMatch = finalMatches.value[i]
        if (finMatch.scoreL > finMatch.scoreR) {
          uitslag.push(finMatch.teamL)
          uitslag.push(finMatch.teamR)
        } else {
          uitslag.push(finMatch.teamR)
          uitslag.push(finMatch.teamL)
        }
        obj = [`${i*2+1}e pl:`, finMatch.teamL + " vs " + finMatch.teamR, `${finMatch.scoreL || ""} - ${finMatch.scoreR || ""}`];
        table.push(obj)
      }
      yPos += 2
      // de finales moeten in twee tabellen naast elkaar: tabel links de matches om de eerste en om de derde plaats
      doc.setFontSize(10)
      const finhead = ["match", "spelers", "uitslag"];
      for (let kolom = 0; kolom < 2; kolom++) {
        const tblBody = kolom === 0 ? table.slice(0, 2) : table.slice(-2)
        // const tblBody = table;
//        console.log("table:", table, "tblBody:", tblBody)
        xPos = marge + (pageWidth / 2 - marge) * kolom
        autoTable(doc, {
          head: [finhead],
          theme: "striped",
          styles: { font: "times", fontSize: 11 },
          startY: yPos,
          headStyles: { fillColor: [5, 93, 165], textColor: [255, 255, 255] }, columnStyles: { 3: { halign: "center" } },
          tableWidth: (tblWidth),
          tableLineWidth: 1,
          body: tblBody,
          margin: { left: xPos },
        });
      }
      yPos = doc.lastAutoTable.finalY
      // uitslag
      if (finalPlayed()) {
        yPos += 2
        doc.line(marge, yPos, pageWidth - marge, yPos);
        doc.setFontSize(18);
        // doc.text(``, pageWidth / 2, (yPos += 8), { align: "center" });
        table = []
        const rankingpunten = [12, 9, 6, 3]
        uitslag.forEach((team, index) => {
          const pnt = rankingpunten[index] || 1
          obj = [`${(index + 1)}e`, team, pnt]
          // if (index === 0) {
          //   obj = ['Winnaars:', team, pnt]
          // }
          table.push(obj)
          // doc.text(`${(index +1)}: ${team}`, pageWidth / 2-20, (yPos += 12), { align: "left" });
        })
        xPos = (pageWidth - tblWidth) / 2
        yPos += 4

        autoTable(doc, {
          head: [["Stand", "Team", "Pnt"]],
          theme: "striped",
          styles: { font: "times", fontSize: 10 },
          startY: yPos,
          headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 139], fontSize: 12 },
          tableWidth: tblWidth,
          tableLineWidth: 1,
          body: table,
          columnStyles: {
            0: { cellWidth: 15 , halign: 'center' },
            1: { cellWidth: 65 },
            2: { cellWidth: 10 , halign: 'center'  },
          },
          margin: { left: xPos },
          bodyStyles: {
            valign: 'middle',
          },
          didParseCell: function (data) {
            if (data.section === "body" && data.row.index === 0) {
              if (data.column.index <= 1) {
                data.cell.styles.fontSize = 20;
              }
            }
            if (data.section === "body" && data.row.index === 1) {
              if (data.column.index <= 1) {
                data.cell.styles.fontSize = 16;
              }
            }
            if (data.section === "body" && data.row.index === 2) {
              if (data.column.index <= 1) {
                data.cell.styles.fontSize = 14;
              }
            }
            if (data.section === "body" && data.row.index === 3) {
              if (data.column.index <= 1) {
                data.cell.styles.fontSize = 12;
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
  // doc.insertPage(1, "after");
}

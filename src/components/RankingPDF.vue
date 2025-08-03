<template>
  <div>
    <button @click="exportPdf" class="bg-blue-500 text-white px-2 rounded mt-1 mr-2" v-tooltip="'Afdrukken naar PDF'"
      style="margin-left:2px; width:auto; height:30px; font-size: .9em;"><printer class="h-6 w-6 text-white" /></button>
  </div>
</template>

<script setup>
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { computed, watch } from "vue";

import { PrinterIcon } from '@heroicons/vue/24/solid'
const printer = PrinterIcon


const props = defineProps({
  toernooien: {
    type: Array,
    required: true
  },
  ranking: {
    type: Array,
    required: true
  },
  datum: {
    type: String,
    required: true
  }
});

const toernooien = computed(() => {
  return [...props.toernooien].sort((a, b) => new Date(a.datum) - new Date(b.datum));
});

const ranking = computed(() => {
  return [...props.ranking].sort((a, b) => a.plaats - b.plaats);
});

function niceDate(date, jaar = false) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    ...(jaar && { year: "numeric" })
  });
}

function getSemester(date, jaar) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // Months are zero-indexed
  let result = month <= 6 ? '1e semester' : '2e semester';
  if (jaar) {

    result += ` ${d.getFullYear()}`;
  }
  return result;
}

let loaded = false;

watch(
  () => [props.ranking, props.toernooien],
  ([ranking, toernooien]) => {
    if (ranking.length > 0 && toernooien.length > 0) {
      loaded = true;
    }
  },
  { immediate: true }
);

function toonPlaats(index) {
  if (index === 0) return ranking.value[0].plaats
  if (ranking.value[index].plaats !== ranking.value[index - 1].plaats) {
    return ranking.value[index].plaats
  }
  return ''
}

function gespeeld(index) {
  let gespeeld = 0;
  ranking.value[index].scores.forEach((res) => {
    if (res.punten !== 0) gespeeld++;
  });
  return gespeeld || 0;
}



function exportPdf() {
  if (!loaded) {
    alert("De gegevens zijn nog niet volledig geladen.");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marge = 20;
  let yPos = 10;
  doc.setFont("times");
  const datum = niceDate(props.datum, true);
  doc.setFontSize(18);
  doc.text("Laurierboom Kraaktoernooi", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(16);
  let txt = "Ranking " + getSemester(props.datum, true);
  if (toernooien.value.length > 0) {
    txt += ` na ${toernooien.value.length} toernooien`;
  } else {
    txt += " (geen toernooien)";
  }

  doc.text(`${txt}`, pageWidth / 2, 25, { align: "center" });
  doc.setFontSize(10);
  doc.line(marge, 35, pageWidth - marge, 35);
  autoTable(doc, {
    head: [["Pl", "Speler", "Gesp", ...toernooien.value.map(t => niceDate(t.datum)), "Beste 6"]],
    body: ranking.value.map((r, index) => [
      toonPlaats(index),
      r.speler,
      gespeeld(index),
      ...toernooien.value.map(t => r.scores.find(s => s.datum === t.datum)?.punten || "-"),
      r.totaal || "-"
    ]),
    theme: "striped",
    startY: 40,
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
        const highScore = ranking.value[0]?.totaal; 
        const currentTotaal = ranking.value[rowIndex]?.totaal;
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
    tableLineWidth: 1,
  });
  yPos = doc.lastAutoTable.finalY + 2;
  const blobPDF = doc.output("blob");
  window.open(URL.createObjectURL(blobPDF));
  // const fileName = `Ranking_${datum}.pdf`;
  // doc.save(fileName);
  // doc.output("dataurlnewwindow");
} 
</script>

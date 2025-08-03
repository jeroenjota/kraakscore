<template>
  <div>
    <button @click="exportPdf" class="bg-blue-500 text-white px-2 rounded mt-1 mr-2" v-tooltip="'Afdrukken naar PDF'"
      style="margin-left:2px; width:auto; height:30px; font-size: .9em;">
      <printer class="h-6 w-6 text-white" />
    </button>
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
  console.log("Jaar:", d);
  const month = d.getMonth() + 1; // Months are zero-indexed
  let result = month <= 6 ? '1e semester' : '2e semester';
  if (jaar) {

    result += ` ${d.getFullYear()}`;
  }
  return result;
}

let loaded = false;

watch(
  () => [props.toernooien, props.ranking],
  ([toernooien, newRanking]) => {
    console.log("Geüpdatete props ontvangen:", toernooien.length, newRanking.length);
    // Hier kun je eventueel auto genereren of opnieuw sorteren
    loaded = true;
  },
  { immediate: true }
);


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
  if (toernooien.length > 0) {
    txt += ` na ${toernooien.length} toernooien`;
  } else {
    txt += " (geen toernooien)";
  }
  doc.text(`${txt}`, pageWidth / 2, 25, { align: "center" });
  doc.setFontSize(10);
  doc.line(marge, 35, pageWidth - marge, 35);
  autoTable(doc, {
    head: [["Plaats", "Speler", "Gesp", ...toernooien.value.map(t => niceDate(t.datum)), "Beste 6"]],
    body: ranking.value.map((r, index) => [
      r.plaats,
      r.speler,
      r.gesp,
      ...toernooien.value.map(t => r.scores.find(s => s.datum === t.datum)?.punten || "-"),
      r.totaal || "-"
    ]),
    theme: "striped",
    styles: { font: "times", fontSize: 10 },
    startY: 40,
    headStyles: { fillColor: [0, 100, 139], fontSize: 12, textColor: [255, 255, 255] },
    columnStyles: { 2: { halign: "center" } },
    // tableWidth: tblWidth,
    tableLineWidth: 1,
    // margin: { left: (pageWidth - tblWidth) / 2 },
    // didParseCell: function (data) {
    //   if (data.section === "body" && data.row.index === 0) {
    //     if (data.column.index === 1) {
    //       data.cell.styles.fontSize = 20;
    //     }
    //   }
    //   if (data.section === "body" && data.row.index === 1) {
    //     if (data.column.index === 1) {
    //       data.cell.styles.fontSize = 18;
    //     }
    //   }
    //   if (data.section === "body" && data.row.index === 2) {
    //     if (data.column.index === 1) {
    //       data.cell.styles.fontSize = 16;
    //     }
    //   }
    // },
  });
  yPos = doc.lastAutoTable.finalY + 2;
  doc.save("kraaktoernooi.pdf");
  // doc.output("dataurlnewwindow");
} 
</script>

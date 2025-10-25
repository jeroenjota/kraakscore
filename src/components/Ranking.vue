<template>

  <div class="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md bg-clip-border ">
    <div class="titelregel flex justify-between items-center  bg-blue-800">
      <h1 class="text-xl font-bold mb-2 bg-blue-800">Ranking na {{ toernooien.length }} toernooien in {{
        getSemester(vanaf, true) }}
      </h1>
      <button @click="maakRankingPdf" class="bg-blue-500 text-white px-2 rounded mt-1 mr-2" v-tooltip="'Afdrukken naar PDF'"
        style="margin-left:2px; width:auto; height:30px; font-size: .9em;">
        <printer class="h-6 w-6 text-white" />
      </button>
    </div>
    <table class="border-2 border-collapse border-gray-800 text-sm  rounded " id="rankingTable">
      <thead>
        <tr class="border-2">
          <th class="p-0 border text-center font-normal w-5">#</th>
          <th class="p-0 border w-5 font-normal">Naam</th>
          <th class="p-0 border text-center w-5 font-normal">Gesp</th>
          <th class="p-0 border text-center font-normal  w-8" v-for="(tn, tnIndex) in toernooien" :key="tnIndex">{{
            niceDate(tn.datum) }}</th>
          <th class="p-0 border text-center font-normal">Beste 6</th>

        </tr>
      </thead>
      <tbody class=" border border-collapse border-gray-800 ">
        <tr class="even:bg-blue-gray-50/50" v-for="(r, index) in ranking" :key="r.speler">
          <td class="p-1 text-center ">{{ toonPlaats(index) }}</td>
          <td class="p-1 border font-semibold">{{ r.speler }}</td>
          <td class="p-1 border text-center text-xs">
            <span v-if="gespeeld(index) !== 0">{{ gespeeld(index) }}</span> <span v-else>-</span>
          </td>
          <td class="p-1 text-center border text-xs" v-for="res in r.scores" :key="res.datum">
            <span v-if="res.punten !== 0">{{ res.punten }}</span> <span v-else>-</span>
          </td>
          <td class="p-1 border text-center font-bold text-blue-800"><span v-if="r.totaal !== 0">{{ r.totaal }}</span>
            <span v-else>-</span></td>
        </tr>
      </tbody>
    </table>
    <p class="text-white text-center text-sm">Punten: 1e = 12; 2e = 9 ; 3e = 6; 4e = 3; 5e of meer: 1 | Beste 6 scores
      tellen</p>
  </div>
</template>

<script setup>
// import { defineProps } from 'vue';
import { computed } from 'vue';
import { rankingPDF } from '../utils/pdf/rankingPDF';
import { jsPDF } from 'jspdf';

import { niceDate, getSemester } from '../utils/dateUtils';

import { PrinterIcon } from '@heroicons/vue/24/solid'
const printer = PrinterIcon


const props = defineProps({
  ranking: {
    type: Array,
    required: true
  },
  toernooien: {
    type: Array,
    default: () => []
  },
  vanaf: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  tot: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
});

const toernooien = computed(() => {
  return props.toernooien.filter(t => new Date(t.datum) >= new Date(props.vanaf) && new Date(t.datum) <= new Date(props.tot)).sort((b, a) => new Date(b.datum) - new Date(a.datum));
});

function maakRankingPdf() {
  // console.log("Ranking PDF aanmaken", props.ranking, toernooien.value, props.vanaf, props.tot);
  const doc = new jsPDF();
  rankingPDF(doc, props.ranking, toernooien.value, props.vanaf);
  doc.save("ranking.pdf");
}


function toonPlaats(index) {
  if (index === 0) return props.ranking[0].plaats
  if (props.ranking[index].plaats !== props.ranking[index - 1].plaats) {
    return props.ranking[index].plaats
  }
  return ''
}

function gespeeld(index) {
  let gespeeld = 0;
  props.ranking[index].scores.forEach((res) => {
    if (res.punten !== 0) gespeeld++;
  });
  return gespeeld || 0;
}

</script>

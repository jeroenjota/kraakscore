<template>

  <div class="relative flex h-full w-full flex-col overflow-scroll bg-white bg-clip-border text-gray-700 shadow-md">
    <div class="titelregel flex items-center justify-between bg-blue-800">
      <h1 class="mb-2 bg-blue-800 text-xl font-bold">Ranking na {{ toernooien.length }} toernooien in {{
        getSemester(vanaf, true) }}
      </h1>
      <button @click="maakRankingPdf" class="mr-2 mt-1 rounded bg-blue-500 px-2 text-white" v-tooltip="'Afdrukken naar PDF'"
        style="margin-left:2px; width:auto; height:30px; font-size: .9em;">
        <printer class="h-6 w-6 text-white" />
      </button>
    </div>
    <table class="border-collapse rounded border-2 border-gray-800 text-sm" id="rankingTable">
      <thead>
        <tr class="border-2">
          <th class="w-5 border p-0 text-center font-normal">#</th>
          <th class="w-5 border p-1 font-normal">Naam</th>
          <th class="w-5 border p-0 text-center font-normal">Gesp</th>
          <th class="w-8 border p-0 text-center font-normal" v-for="(tn, tnIndex) in toernooien" :key="tnIndex">
            <span class="block">{{ niceDate(tn.datum) }}</span>
            <span class="block" style="font-size: 6pt; line-height: 1;">{{ formatToernooiTeamLabel(tn) }}</span>
          </th>
          <th class="border p-0 text-center font-normal">Gem</th>
          <th class="border p-0 text-center font-normal">Beste 6</th>

        </tr>
      </thead>
      <tbody class="border-collapse border border-gray-800">
        <tr class="even:bg-blue-gray-50/50" v-for="(r, index) in ranking" :key="r.speler">
          <td class="p-1 text-center">{{ toonPlaats(index) }}</td>
          <td class="border p-1 font-semibold">{{ r.speler }}</td>
          <td class="border p-1 text-center text-xs">
            <span v-if="gespeeld(index) !== 0">{{ gespeeld(index) }}</span> <span v-else>-</span>
          </td>
          <td class="border p-1 text-center text-xs" v-for="res in r.scores" :key="res.datum">
            <span
              v-if="res.punten !== 0"
              :class="scoreStyleClass(r, res)"
            >
              {{ res.punten }}
            </span>
            <span v-else>-</span>
          </td>
          <td class="border p-1 text-center text-xs text-blue-600">
            <template v-if="gespeeld(index) !== 0">
              <span v-if="!getGemiddeldeDelen(r, index).heeftBreuk">{{ getGemiddeldeDelen(r, index).geheel }}</span>
              <span v-else class="gem-value">
                <span v-if="getGemiddeldeDelen(r, index).geheel > 0" class="gem-whole">{{ getGemiddeldeDelen(r, index).geheel }}</span>
                <span class="gem-frac" aria-label="Breuk">
                  <span class="gem-num">{{ getGemiddeldeDelen(r, index).teller }}</span>
                  <span class="gem-den">{{ getGemiddeldeDelen(r, index).noemer }}</span>
                </span>
              </span>
            </template>
            <span v-else>-</span>
          </td>
          <td class="border p-1 text-center font-bold text-blue-800"><span v-if="r.totaal !== 0">{{ r.totaal }}</span>
            <span v-else>-</span></td>
        </tr>
      </tbody>
    </table>
    <p class="text-center text-sm text-white">Punten: 1e = 12; 2e = 9 ; 3e = 6; 4e = 3; 5e of meer: 1 | Beste 6 scores
      tellen</p>
    <p class="text-center text-xs text-white">Vet + onderstreept = telt mee, doorgehaald = telt niet mee</p>
  </div>
</template>

<script setup>
// import { defineProps } from 'vue';
import { computed } from 'vue';

import { niceDate, getSemester } from '../utils/dateUtils';

import { PrinterIcon } from '@heroicons/vue/24/solid'
const printer = PrinterIcon

let rankingPdfDependenciesPromise = null;

async function loadRankingPdfDependencies() {
  if (!rankingPdfDependenciesPromise) {
    rankingPdfDependenciesPromise = Promise.all([
      import('../utils/pdf/rankingPDF'),
      import('jspdf'),
    ]).then(([rankingPdfModule, jspdfModule]) => {
      const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default;
      if (!jsPDF) {
        throw new Error('jsPDF kon niet worden geladen.');
      }

      return {
        jsPDF,
        rankingPDF: rankingPdfModule.rankingPDF,
      };
    });
  }

  return rankingPdfDependenciesPromise;
}


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

async function maakRankingPdf() {
  // console.log("Ranking PDF aanmaken", props.ranking, toernooien.value, props.vanaf, props.tot);
  const { jsPDF, rankingPDF } = await loadRankingPdfDependencies();
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

function getGemiddeldeDelen(spelerRanking, index) {
  const aantalGespeeld = gespeeld(index);
  if (!aantalGespeeld) return null;

  const totaal = spelerRanking.totaal || 0;
  const geheel = Math.floor(totaal / aantalGespeeld);
  const rest = totaal % aantalGespeeld;
  if (rest === 0) {
    return {
      geheel,
      teller: 0,
      noemer: 1,
      heeftBreuk: false,
    };
  }

  const gcd = (a, b) => {
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  };

  const deler = gcd(rest, aantalGespeeld);
  const teller = rest / deler;
  const noemer = aantalGespeeld / deler;

  return {
    geheel,
    teller,
    noemer,
    heeftBreuk: true,
  };
}

function getTeamCount(toernooi) {
  if (!toernooi?.teams) return 0;
  if (Array.isArray(toernooi.teams)) return toernooi.teams.length;
  if (typeof toernooi.teams === 'string') {
    try {
      const parsed = JSON.parse(toernooi.teams);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

function formatToernooiTeamLabel(toernooi) {
  const aantalTeams = getTeamCount(toernooi);
  const teamLabel = aantalTeams === 1 ? 'tm' : 'tms';
  return `(${aantalTeams} ${teamLabel})`;
}

function getMeeTellendeDatums(spelerRanking) {
  return new Set(
    (spelerRanking.scores || [])
      .map((score, index) => ({ ...score, index }))
      .filter((score) => score.punten > 0)
      .sort((a, b) => b.punten - a.punten || a.index - b.index)
      .slice(0, 6)
      .map((score) => score.datum)
  );
}

function scoreStyleClass(spelerRanking, score) {
  const meetellendeDatums = getMeeTellendeDatums(spelerRanking);
  return meetellendeDatums.has(score.datum)
    ? 'font-bold text-[13px]'
    : '';
}

 </script>

<style scoped>
.gem-value {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.gem-whole {
  font-size: 0.95em;
  line-height: 1;
}

.gem-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  min-width: 12px;
}

.gem-num,
.gem-den {
  display: block;
  font-size: 0.7em;
  line-height: 1;
}

.gem-den {
  border-top: 1px solid currentColor;
  margin-top: 1px;
  padding-top: 1px;
}
</style>

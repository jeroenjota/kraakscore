<!--  Eventueel voor toekomstig gebruik -->
<template>
  <main class="min-h-dvh bg-slate-100 p-2 sm:p-4">
    <div class="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <header class="mb-3 border-b border-slate-200 pb-3">
        <h1 class="text-center text-xl font-bold text-slate-900">Scoreformulier {{ datumText }}</h1>
        <p class="text-center text-sm text-slate-600">ronde {{ round || "?" }} | tafel {{ table || "?" }}</p>
      </header>

      <section class="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-md border px-3 py-2 text-left font-semibold"
          :class="troefState.activeTeam === 'L' ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-slate-200 text-slate-700'"
          @click="setTroefActiveTeam('L')"
        >
          {{ teamL }}
        </button>
        <button
          type="button"
          class="rounded-md border px-3 py-2 text-left font-semibold"
          :class="troefState.activeTeam === 'R' ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-slate-200 text-slate-700'"
          @click="setTroefActiveTeam('R')"
        >
          {{ teamR }}
        </button>
      </section>

      <section v-if="teamChosen" class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p>Troef</p>
        <div class="mt-2 grid grid-cols-8 gap-2">
          
          <button
            v-for="suit in suits"
            :key="suit.value"
            type="button"
            :class="[
              'rounded-md border px-2 py-0 text-center text-lg',
              selectedSuit === suit.value ? 'border-sky-500 bg-green-200' : 'border-slate-200 bg-white',
              suitTextClass(suit.value), 
            ]"
            :disabled="!troefState.ownerTeam || hasReachedScoreTarget"
            @click="setSelectedSuit(suit.value)"
          >
            {{ suit.label }}
          </button>
        </div>
      </section>

      <section class="mb-3 rounded-lg border border-slate-200 p-3">
        <div class="mb-2 grid grid-cols-2 gap-2">
          <label class="text-xs font-medium text-slate-600">Punten {{ teamL }}
            <input
              v-model.number="pointsL"
              type="number"
              min="0"
              max="162"
              class="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              :disabled="!canEditCurrentPartij"
              @input="setFixedTotalPoints('L')"
            />
          </label>
          <label class="text-xs font-medium text-slate-600">Punten {{ teamR }}
            <input
              v-model.number="pointsR"
              type="number"
              min="0"
              max="162"
              class="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              :disabled="!canEditCurrentPartij"
              @input="setFixedTotalPoints('R')"
            />
          </label>
        </div>

        <div class="mb-2 grid grid-cols-2 gap-2">
          <label class="text-xs font-medium text-slate-600">Roem {{ teamL }}
            <input
              v-model.number="roemL"
              type="number"
              min="0"
              class="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              :disabled="!canEditCurrentPartij"
            />
          </label>
          <label class="text-xs font-medium text-slate-600">Roem {{ teamR }}
            <input
              v-model.number="roemR"
              type="number"
              min="0"
              class="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              :disabled="!canEditCurrentPartij"
            />
          </label>
        </div>

        <div class="mb-2 grid grid-cols-2 gap-2">
          <label class="text-xs font-medium text-slate-600">Invoer kruis {{ teamL }}
            <input
              v-model.number="inputKruisL"
              type="number"
              min="0"
              max="32"
              class="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              :disabled="!canEditCurrentPartij"
            />
          </label>
          <label class="text-xs font-medium text-slate-600">Invoer kruis {{ teamR }}
            <input
              v-model.number="inputKruisR"
              type="number"
              min="0"
              max="32"
              class="mt-1 w-full rounded border border-slate-300 px-2 py-1"
              :disabled="!canEditCurrentPartij"
            />
          </label>
        </div>

        <div class="mb-2 grid grid-cols-4 gap-2">
          <button
            v-for="flag in scoreFlags"
            :key="flag.value"
            type="button"
            class="rounded-md border px-2 py-1 text-sm"
            :disabled="!canEditCurrentPartij"
            :class="scoreFlagState === flag.value ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-700'"
            @click="toggleScoreFlag(flag.value)"
          >
            {{ flag.label }}
          </button>
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
            :disabled="!canEditCurrentPartij"
            @click="scoreFlagState = null"
          >
            Geen
          </button>
        </div>

        <div class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700">
          Berekend: {{ computedPreview.scoreL }} - {{ computedPreview.scoreR }}
          <span class="ml-1 text-xs text-slate-500">(x{{ computedPreview.scoreMultiplier }})</span>
        </div>
      </section>

      <section class="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="!canCalculate"
          @click="calculateCurrentPartijTotal"
        >
          Bereken totaal
        </button>
        <button
          type="button"
          class="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="!canAddPartij"
          @click="addPartij"
        >
          Voeg partij toe
        </button>
        <button
          type="button"
          class="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="partijen.length === 0"
          @click="undoPartij"
        >
          Undo partij
        </button>
      </section>

      <section class="mb-3 rounded-lg border border-slate-200 p-3">
        <h2 class="mb-2 text-sm font-semibold text-slate-800">Partijen</h2>
        <div v-if="partijen.length === 0" class="text-sm text-slate-500">Nog geen partijen toegevoegd.</div>
        <ul v-else class="space-y-1 text-sm">
          <li v-for="(partij, index) in partijen" :key="index" class="grid grid-cols-[2rem_1fr_auto_auto] gap-2 rounded border border-slate-100 px-2 py-1">
            <span class="font-semibold text-slate-600">{{ index + 1 }}.</span>
            <span class="text-slate-700">
              {{ partij.troefTeam }}
              <span :class="suitTextClass(partij.troefSuit)">{{ suitLabel(partij.troefSuit) }}</span>
              {{ partij.scoreFlag ? scoreFlagLabel(partij.scoreFlag) : '' }}
            </span>
            <span class="font-semibold text-slate-900">{{ partij.scoreL }}</span>
            <span class="font-semibold text-slate-900">{{ partij.scoreR }}</span>
          </li>
        </ul>
      </section>

      <section class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="text-sm font-semibold text-slate-800">Totaal: {{ totals.currentTotals.left }} - {{ totals.currentTotals.right }}</div>
        <div class="text-xs text-slate-600">Kruis totaal: {{ totals.kruisTotals.left }}X - {{ totals.kruisTotals.right }}X</div>
        <div class="text-xs text-slate-600">Basis (zonder kruis-afrekening): {{ totals.baseTotals.left }} - {{ totals.baseTotals.right }}</div>
      </section>

      <section class="flex flex-wrap gap-2">
        <button
          v-if="mode === 'final'"
          type="button"
          class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="partijen.length === 0 || !hasReachedScoreTarget || sendInFlight"
          @click="submitFinal"
        >
          Verstuur eindstand
        </button>

        <button
          type="button"
          class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
          @click="viewStand"
        >
          Bekijk tussenstand
        </button>
      </section>

      <p v-if="message" class="mt-3 rounded-md px-2 py-1 text-sm" :class="messageClass">{{ message }}</p>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { resolveApiBaseUrl } from "../services/apiConfig.js";

const TOTAL_POINTS_PER_PARTIJ = 162;

const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

const mode = params.get("mode") === "final" ? "final" : "immediate";
const tournamentId = params.get("tid");
const date = params.get("date");
const matchType = params.get("mt") || "single";
const group = params.get("group");
const round = params.get("round");
const table = params.get("table");
const matchIndex = params.get("mi");
const finalIndex = params.get("fi");
const teamL = params.get("teamL") || "Team links";
const teamR = params.get("teamR") || "Team rechts";
const scoreTarget = Number(params.get("scoreTarget") || 2000);
const winKruis = Number(params.get("winnerKruis") || 4);
const initialBaseTotalsFromParams = {
  left: Math.max(0, Number(params.get("startScoreL") || 0) || 0),
  right: Math.max(0, Number(params.get("startScoreR") || 0) || 0),
};
const initialKruisTotalsFromParams = {
  left: Math.max(0, Number(params.get("startKruisL") || 0) || 0),
  right: Math.max(0, Number(params.get("startKruisR") || 0) || 0),
};
const initialLastTroefTeam = ["L", "R"].includes(params.get("lastTroefTeam"))
  ? params.get("lastTroefTeam")
  : null;

const datumText = computed(() => {
  if (!date) return "?";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "?";
  return parsed.toLocaleDateString("nl-NL", { dateStyle: "medium" });
});
const teamChosen = ref(false)
const pointsL = ref(0);
const pointsR = ref(0);
const roemL = ref(0);
const roemR = ref(0);
const inputKruisL = ref(0);
const inputKruisR = ref(0);
const scoreFlagState = ref(null);
const hasCalculatedTotal = ref(false);
const partijen = ref([]);
const sendInFlight = ref(false);
const sendAgain = ref(false);
const lastSubmittedWasFinal = ref(false);
const message = ref("");
const messageType = ref("info");
const baseOffsetTotals = ref({ ...initialBaseTotalsFromParams });
const kruisOffsetTotals = ref({ ...initialKruisTotalsFromParams });

const troefState = reactive({
  activeTeam: initialLastTroefTeam ? (initialLastTroefTeam === "L" ? "R" : "L") : null,
  ownerTeam: null,
  selectedSuit: { L: null, R: null },
});

const suits = [
  { value: "clubs", label: "♣" },
  { value: "diamonds", label: "♦" },
  { value: "hearts", label: "♥" },
  { value: "spades", label: "♠" },
];

const scoreFlags = [
  { value: "kraak", label: "Kraak !" },
  { value: "re", label: "Rekraak !!" },
  { value: "super", label: "Super !!!" },
];

const selectedSuit = computed(() => (troefState.ownerTeam ? troefState.selectedSuit[troefState.ownerTeam] : null));

function setMessage(text, type = "info") {
  message.value = text;
  messageType.value = type;
}

const messageClass = computed(() => {
  if (messageType.value === "ok") return "bg-emerald-50 text-emerald-800";
  if (messageType.value === "err") return "bg-rose-50 text-rose-800";
  return "bg-slate-100 text-slate-700";
});

function clampNumber(value, min = 0, max = Infinity) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function getPartijMultiplierBySuit(troefSuit) {
  return troefSuit === "spades" ? 2 : 1;
}

function getScoreFlagMultiplier(flag) {
  if (flag === "kraak") return 2;
  if (flag === "re") return 4;
  if (flag === "super") return 8;
  return 1;
}

function getSpelendePartij(troefTeam, scoreFlag) {
  if (troefTeam !== "L" && troefTeam !== "R") return troefTeam;
  if (scoreFlag === "kraak" || scoreFlag === "super") {
    return troefTeam === "L" ? "R" : "L";
  }
  return troefTeam;
}

function computePartijScores({
  calcPointsL,
  calcPointsR,
  calcRoemL,
  calcRoemR,
  troefTeam,
  troefSuit,
  scoreFlag,
}) {
  const suitMultiplier = getPartijMultiplierBySuit(troefSuit);
  const flagMultiplier = getScoreFlagMultiplier(scoreFlag);
  const partijMultiplier = suitMultiplier * flagMultiplier;
  let baseScoreL = calcPointsL + calcRoemL;
  let baseScoreR = calcPointsR + calcRoemR;
  const totaalVoorNatL = baseScoreL;
  const totaalVoorNatR = baseScoreR;
  let extraKruisL = 0;
  let extraKruisR = 0;
  let pitBonusL = 0;
  let pitBonusR = 0;

  if (calcPointsL === TOTAL_POINTS_PER_PARTIJ && calcPointsR === 0) {
    baseScoreL = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
    baseScoreR = 0;
    pitBonusL = 100;
    extraKruisR += partijMultiplier;
  } else if (calcPointsR === TOTAL_POINTS_PER_PARTIJ && calcPointsL === 0) {
    baseScoreR = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
    baseScoreL = 0;
    pitBonusR = 100;
    extraKruisL += partijMultiplier;
  }

  if (scoreFlag === "kraak" || scoreFlag === "re" || scoreFlag === "super") {
    const spelendePartij = getSpelendePartij(troefTeam, scoreFlag);
    if (totaalVoorNatL < totaalVoorNatR) {
      baseScoreL = 0;
      baseScoreR = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
      extraKruisL += partijMultiplier;
    } else if (totaalVoorNatR < totaalVoorNatL) {
      baseScoreR = 0;
      baseScoreL = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
      extraKruisR += partijMultiplier;
    } else if (spelendePartij === "L") {
      baseScoreL = 0;
      baseScoreR = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
      extraKruisL += partijMultiplier;
    } else if (spelendePartij === "R") {
      baseScoreR = 0;
      baseScoreL = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
      extraKruisR += partijMultiplier;
    }
  } else if (troefTeam === "L" && totaalVoorNatL <= totaalVoorNatR) {
    baseScoreL = 0;
    baseScoreR = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
    extraKruisL += partijMultiplier;
  } else if (troefTeam === "R" && totaalVoorNatR <= totaalVoorNatL) {
    baseScoreR = 0;
    baseScoreL = TOTAL_POINTS_PER_PARTIJ + calcRoemL + calcRoemR;
    extraKruisR += partijMultiplier;
  }

  return {
    scoreL: (baseScoreL + pitBonusL) * partijMultiplier,
    scoreR: (baseScoreR + pitBonusR) * partijMultiplier,
    scoreMultiplier: partijMultiplier,
    extraKruisL,
    extraKruisR,
  };
}

const computedPreview = computed(() => computePartijScores({
  calcPointsL: clampNumber(pointsL.value, 0, TOTAL_POINTS_PER_PARTIJ),
  calcPointsR: clampNumber(pointsR.value, 0, TOTAL_POINTS_PER_PARTIJ),
  calcRoemL: clampNumber(roemL.value, 0, 9999),
  calcRoemR: clampNumber(roemR.value, 0, 9999),
  troefTeam: troefState.ownerTeam,
  troefSuit: selectedSuit.value,
  scoreFlag: scoreFlagState.value,
}));

function getTotals() {
  return partijen.value.reduce(
    (acc, partij) => {
      acc.left += partij.scoreL;
      acc.right += partij.scoreR;
      return acc;
    },
    { left: baseOffsetTotals.value.left, right: baseOffsetTotals.value.right },
  );
}

function getKruisTotals() {
  return partijen.value.reduce(
    (acc, partij) => {
      acc.left += partij.kruisL || 0;
      acc.right += partij.kruisR || 0;
      return acc;
    },
    { left: kruisOffsetTotals.value.left, right: kruisOffsetTotals.value.right },
  );
}

function getRoemTotals() {
  return partijen.value.reduce(
    (acc, partij) => {
      acc.left += partij.roemL || 0;
      acc.right += partij.roemR || 0;
      return acc;
    },
    { left: 0, right: 0 },
  );
}

function getLastTroefTeam() {
  if (partijen.value.length === 0) return initialLastTroefTeam;
  return partijen.value[partijen.value.length - 1]?.troefTeam || null;
}

function getMatchTotals(isFinal = false) {
  const baseTotals = getTotals();
  const kruisTotals = getKruisTotals();
  const currentTotals = { left: baseTotals.left, right: baseTotals.right };
  let winnerTeam = null;
  const loserBonusKruis = { left: 0, right: 0 };

  if (isFinal && partijen.value.length > 0) {
    const bothAboveTarget = currentTotals.left > scoreTarget && currentTotals.right > scoreTarget;
    if (bothAboveTarget) {
      winnerTeam = getLastTroefTeam();
    } else if (currentTotals.left > currentTotals.right) {
      winnerTeam = "L";
    } else if (currentTotals.right > currentTotals.left) {
      winnerTeam = "R";
    } else {
      winnerTeam = getLastTroefTeam();
    }

    if (winnerTeam === "L") {
      loserBonusKruis.right = winKruis;
    } else if (winnerTeam === "R") {
      loserBonusKruis.left = winKruis;
    }
  }

  const finalKruisTotals = {
    left: kruisTotals.left + loserBonusKruis.left,
    right: kruisTotals.right + loserBonusKruis.right,
  };

  const finalTotals = {
    left: baseTotals.left + finalKruisTotals.right * 100,
    right: baseTotals.right + finalKruisTotals.left * 100,
  };

  return { baseTotals, kruisTotals, currentTotals, winnerTeam, loserBonusKruis, finalKruisTotals, finalTotals };
}

const totals = computed(() => getMatchTotals(false));

const hasReachedScoreTarget = computed(() => {
  const { baseTotals } = getMatchTotals(false);
  return baseTotals.left > scoreTarget || baseTotals.right > scoreTarget;
});

const canEditCurrentPartij = computed(() => Boolean(troefState.ownerTeam && selectedSuit.value) && !hasReachedScoreTarget.value);

const canCalculate = computed(() => {
  if (!canEditCurrentPartij.value) return false;
  return clampNumber(pointsL.value, 0, TOTAL_POINTS_PER_PARTIJ) + clampNumber(pointsR.value, 0, TOTAL_POINTS_PER_PARTIJ) === TOTAL_POINTS_PER_PARTIJ;
});

const canAddPartij = computed(() => canEditCurrentPartij.value && hasCalculatedTotal.value);

function setTroefActiveTeam(team) {
  if (team !== "L" && team !== "R") return;
  if (hasReachedScoreTarget.value) return;
  troefState.activeTeam = team;
  troefState.ownerTeam = team
  teamChosen.value = true;
}

function setSelectedSuit(suit) {
  if (!troefState.ownerTeam || hasReachedScoreTarget.value) return;
  troefState.selectedSuit[troefState.ownerTeam] = suit;
  hasCalculatedTotal.value = false;
}

function toggleScoreFlag(flag) {
  scoreFlagState.value = scoreFlagState.value === flag ? null : flag;
  hasCalculatedTotal.value = false;
}

function setFixedTotalPoints(changedTeam) {
  const source = changedTeam === "L" ? pointsL : pointsR;
  const target = changedTeam === "L" ? pointsR : pointsL;
  const sourceValue = clampNumber(source.value, 0, TOTAL_POINTS_PER_PARTIJ);
  source.value = sourceValue;
  target.value = TOTAL_POINTS_PER_PARTIJ - sourceValue;
  hasCalculatedTotal.value = false;
}

function calculateCurrentPartijTotal() {
  if (!canCalculate.value) {
    setMessage(`Getelde punten moeten samen precies ${TOTAL_POINTS_PER_PARTIJ} zijn.`, "err");
    return;
  }

  hasCalculatedTotal.value = true;
  setMessage("Totaal berekend.", "ok");
}

function resetCurrentPartij(nextTroefTeam) {
  pointsL.value = 0;
  pointsR.value = 0;
  roemL.value = 0;
  roemR.value = 0;
  inputKruisL.value = 0;
  inputKruisR.value = 0;
  scoreFlagState.value = null;
  hasCalculatedTotal.value = false;
  troefState.activeTeam = nextTroefTeam;
  troefState.ownerTeam = null;
  if (nextTroefTeam) {
    troefState.selectedSuit[nextTroefTeam] = null;
  }
}

async function sendCurrentTotal(forceMessage = false, isFinal = false) {
  if (partijen.value.length === 0) return false;
  if (sendInFlight.value) {
    sendAgain.value = true;
    return false;
  }

  sendInFlight.value = true;
  const {
    baseTotals,
    kruisTotals,
    currentTotals,
    winnerTeam,
    loserBonusKruis,
    finalKruisTotals,
    finalTotals,
  } = getMatchTotals(isFinal);
  const roemTotals = getRoemTotals();
  const scoreTotals = isFinal ? finalTotals : currentTotals;
  const appliedKruisTotals = isFinal ? finalKruisTotals : kruisTotals;
  const bonusPoints = {
    left: appliedKruisTotals.right * 100,
    right: appliedKruisTotals.left * 100,
  };

  if (forceMessage) {
    setMessage("Versturen...", "info");
  }

  try {
    const payload = {
      tournamentId,
      tournamentDate: date,
      mode,
      matchType,
      group,
      round,
      table,
      matchIndex,
      finalIndex,
      teamL,
      teamR,
      scoreL: scoreTotals.left,
      scoreR: scoreTotals.right,
      baseScoreL: baseTotals.left,
      baseScoreR: baseTotals.right,
      roemL: roemTotals.left,
      roemR: roemTotals.right,
      kruisL: appliedKruisTotals.left,
      kruisR: appliedKruisTotals.right,
      loserBonusKruisL: loserBonusKruis.left,
      loserBonusKruisR: loserBonusKruis.right,
      bonusPointsL: bonusPoints.left,
      bonusPointsR: bonusPoints.right,
      winnerTeam,
      lastTroefTeam: getLastTroefTeam(),
      partyCount: partijen.value.length,
      parties: partijen.value,
      isFinal,
      submittedAt: new Date().toISOString(),
    };

    const apiBase = resolveApiBaseUrl();
    const endpoints = [
      `${apiBase}/score-forms/submit`,
      `${apiBase}/score-entries/log`,
    ];

    let lastError = "Onbekende fout";
    let delivered = false;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          delivered = true;
          break;
        }

        const responseText = await response.text();
        lastError = `API fout (${response.status}) ${responseText || ""}`.trim();
      } catch (error) {
        lastError = error?.message || "Netwerkfout";
      }
    }

    if (!delivered) {
      throw new Error(lastError);
    }

    lastSubmittedWasFinal.value = isFinal;
    if (forceMessage) {
      setMessage(`Stand verstuurd: ${scoreTotals.left} - ${scoreTotals.right}`, "ok");
    }
    return true;
  } catch (error) {
    setMessage(`Versturen mislukt: ${error.message}`, "err");
    return false;
  } finally {
    sendInFlight.value = false;
    if (sendAgain.value) {
      sendAgain.value = false;
      queueMicrotask(() => {
        sendCurrentTotal(false, false).catch(() => {});
      });
    }
  }
}

async function addPartij() {
  const safePointsL = clampNumber(pointsL.value, 0, TOTAL_POINTS_PER_PARTIJ);
  const safePointsR = clampNumber(pointsR.value, 0, TOTAL_POINTS_PER_PARTIJ);
  const safeRoemL = clampNumber(roemL.value, 0, 9999);
  const safeRoemR = clampNumber(roemR.value, 0, 9999);
  const safeInputKruisL = clampNumber(inputKruisL.value, 0, 32);
  const safeInputKruisR = clampNumber(inputKruisR.value, 0, 32);

  if (safePointsL + safePointsR !== TOTAL_POINTS_PER_PARTIJ) {
    setMessage(`Getelde punten moeten samen precies ${TOTAL_POINTS_PER_PARTIJ} zijn.`, "err");
    return;
  }

  if (!troefState.ownerTeam || !selectedSuit.value) {
    setMessage("Kies eerst een troefkleur.", "err");
    return;
  }

  const computedScores = computePartijScores({
    calcPointsL: safePointsL,
    calcPointsR: safePointsR,
    calcRoemL: safeRoemL,
    calcRoemR: safeRoemR,
    troefTeam: troefState.ownerTeam,
    troefSuit: selectedSuit.value,
    scoreFlag: scoreFlagState.value,
  });

  partijen.value.push({
    pointsL: safePointsL,
    pointsR: safePointsR,
    troefTeam: troefState.ownerTeam,
    troefSuit: selectedSuit.value,
    scoreFlag: scoreFlagState.value,
    scoreMultiplier: computedScores.scoreMultiplier,
    scoreL: computedScores.scoreL,
    scoreR: computedScores.scoreR,
    roemL: safeRoemL,
    roemR: safeRoemR,
    kruisL: safeInputKruisL + computedScores.extraKruisL,
    kruisR: safeInputKruisR + computedScores.extraKruisR,
    inputKruisL: safeInputKruisL,
    inputKruisR: safeInputKruisR,
  });

  const nextTroefTeam = troefState.ownerTeam === "L" ? "R" : "L";
  resetCurrentPartij(nextTroefTeam);
  hasCalculatedTotal.value = true;
  setMessage("Partij toegevoegd.", "ok");

  if (mode !== "final") {
    await sendCurrentTotal(true, false);
  }
}

async function undoPartij() {
  if (partijen.value.length === 0) {
    setMessage("Er is geen partij om ongedaan te maken.", "err");
    return;
  }

  const revertFinalSubmission = lastSubmittedWasFinal.value;
  lastSubmittedWasFinal.value = false;
  const removedPartij = partijen.value.pop();

  pointsL.value = Number(removedPartij?.pointsL ?? 0);
  pointsR.value = Number(removedPartij?.pointsR ?? 0);
  roemL.value = Number(removedPartij?.roemL ?? 0);
  roemR.value = Number(removedPartij?.roemR ?? 0);
  inputKruisL.value = Number(removedPartij?.inputKruisL ?? 0);
  inputKruisR.value = Number(removedPartij?.inputKruisR ?? 0);
  scoreFlagState.value = removedPartij?.scoreFlag || null;
  troefState.activeTeam = removedPartij?.troefTeam || null;
  troefState.ownerTeam = removedPartij?.troefTeam || null;
  troefState.selectedSuit.L = null;
  troefState.selectedSuit.R = null;
  if (removedPartij?.troefTeam && removedPartij?.troefSuit) {
    troefState.selectedSuit[removedPartij.troefTeam] = removedPartij.troefSuit;
  }
  hasCalculatedTotal.value = true;

  if (mode !== "final" || revertFinalSubmission) {
    await sendCurrentTotal(true, false);
  }

  if (revertFinalSubmission) {
    setMessage("Eindstand ongedaan gemaakt. Tussenstand opnieuw berekend.", "ok");
  } else {
    setMessage("Laatste partij ongedaan gemaakt.", "ok");
  }
}

async function submitFinal() {
  if (partijen.value.length === 0) {
    setMessage("Voeg minimaal 1 partij toe voordat je verstuurt.", "err");
    return;
  }

  const sent = await sendCurrentTotal(true, true);
  if (!sent) {
    return;
  }

  setMessage("Eindtotaal verstuurd. Tik op 'Bekijk tussenstand'.", "ok");
}

function buildStandingsUrl() {
  const base = typeof window === "undefined"
    ? "http://localhost/"
    : new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  const url = new URL(base);
  if (tournamentId) {
    url.searchParams.set("tid", String(tournamentId));
  }
  url.searchParams.set("view", "stand");
  return url.toString();
}

function viewStand() {
  if (typeof window === "undefined") return;
  window.location.href = buildStandingsUrl();
}

function suitLabel(suit) {
  if (suit === "clubs") return "♣";
  if (suit === "diamonds") return "♦";
  if (suit === "hearts") return "♥";
  if (suit === "spades") return "♠";
  return "";
}

function suitTextClass(suit) {
  if (suit === "diamonds" || suit === "hearts") return "text-red-700";
  return "text-slate-700";
}

function scoreFlagLabel(flag) {
  if (flag === "kraak") return "!";
  if (flag === "re") return "!!";
  if (flag === "super") return "!!!";
  return "";
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function asInt(value, fallback = 0) {
  if (!isFiniteNumber(value)) return fallback;
  return Math.trunc(Number(value));
}

function asNonNegativeInt(value, fallback = 0) {
  return Math.max(0, asInt(value, fallback));
}

function sameText(a, b) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function toMatchIdentifier(entry, key) {
  const raw = entry?.[key];
  if (!Number.isFinite(Number(raw))) return null;
  return Number(raw);
}

function isEntryForCurrentMatch(entry) {
  if (!entry || !sameText(entry.matchType || "single", matchType || "single")) {
    return false;
  }

  const sameTeams = sameText(entry.teamL, teamL) && sameText(entry.teamR, teamR);

  if (matchType === "final") {
    const entryFinalIndex = toMatchIdentifier(entry, "finalIndex");
    const currentFinalIndex = Number.isFinite(Number(finalIndex)) ? Number(finalIndex) : null;
    const sameFinalIndex =
      entryFinalIndex !== null &&
      currentFinalIndex !== null &&
      entryFinalIndex === currentFinalIndex;

    const samePlace =
      Number.isFinite(Number(entry.place)) &&
      Number.isFinite(Number(params.get("place"))) &&
      Number(entry.place) === Number(params.get("place"));

    return sameFinalIndex || samePlace || sameTeams;
  }

  const sameRound =
    Number.isFinite(Number(entry.round)) &&
    Number.isFinite(Number(round)) &&
    Number(entry.round) === Number(round);

  const sameMatchIndex =
    Number.isFinite(Number(entry.matchIndex)) &&
    Number.isFinite(Number(matchIndex)) &&
    Number(entry.matchIndex) === Number(matchIndex);

  const sameTable =
    Number.isFinite(Number(entry.table)) &&
    Number.isFinite(Number(table)) &&
    Number(entry.table) === Number(table);

  if (matchType === "group") {
    const sameGroup = sameText(entry.group, group);
    return sameGroup && (sameMatchIndex || sameTable || sameTeams);
  }

  return (sameRound && sameMatchIndex) || (sameRound && sameTable) || sameTeams;
}

function normalizePartij(partij) {
  const normalizedTroefTeam = partij?.troefTeam === "L" || partij?.troefTeam === "R"
    ? partij.troefTeam
    : null;

  return {
    pointsL: asNonNegativeInt(partij?.pointsL),
    pointsR: asNonNegativeInt(partij?.pointsR),
    troefTeam: normalizedTroefTeam,
    troefSuit: partij?.troefSuit ?? null,
    scoreFlag: partij?.scoreFlag ?? null,
    scoreMultiplier: asNonNegativeInt(partij?.scoreMultiplier, 1) || 1,
    scoreL: asNonNegativeInt(partij?.scoreL),
    scoreR: asNonNegativeInt(partij?.scoreR),
    roemL: asNonNegativeInt(partij?.roemL),
    roemR: asNonNegativeInt(partij?.roemR),
    kruisL: asNonNegativeInt(partij?.kruisL),
    kruisR: asNonNegativeInt(partij?.kruisR),
    inputKruisL: asNonNegativeInt(partij?.inputKruisL),
    inputKruisR: asNonNegativeInt(partij?.inputKruisR),
  };
}

function getEntryMoment(entry) {
  const value = entry?.submittedAt || entry?.timestamp;
  const parsed = new Date(value || "");
  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getTime();
}

function getLatestMatchSubmission(entries) {
  return entries
    .filter((entry) => isEntryForCurrentMatch(entry))
    .sort((a, b) => getEntryMoment(b) - getEntryMoment(a))[0];
}

function applyRestoredSubmission(entry) {
  const restoredPartijen = Array.isArray(entry?.parties)
    ? entry.parties.map(normalizePartij)
    : [];

  if (restoredPartijen.length === 0) {
    return false;
  }

  const summedPartijen = restoredPartijen.reduce(
    (acc, partij) => {
      acc.scoreL += asNonNegativeInt(partij.scoreL);
      acc.scoreR += asNonNegativeInt(partij.scoreR);
      acc.kruisL += asNonNegativeInt(partij.kruisL);
      acc.kruisR += asNonNegativeInt(partij.kruisR);
      return acc;
    },
    { scoreL: 0, scoreR: 0, kruisL: 0, kruisR: 0 },
  );

  const restoredBaseL = isFiniteNumber(entry?.baseScoreL)
    ? Number(entry.baseScoreL)
    : isFiniteNumber(entry?.scoreL)
      ? Number(entry.scoreL)
      : null;
  const restoredBaseR = isFiniteNumber(entry?.baseScoreR)
    ? Number(entry.baseScoreR)
    : isFiniteNumber(entry?.scoreR)
      ? Number(entry.scoreR)
      : null;

  const restoredKruisL = isFiniteNumber(entry?.kruisL)
    ? Number(entry.kruisL)
    : null;
  const restoredKruisR = isFiniteNumber(entry?.kruisR)
    ? Number(entry.kruisR)
    : null;

  if (restoredBaseL !== null && restoredBaseR !== null) {
    baseOffsetTotals.value = {
      left: Math.max(0, Math.trunc(restoredBaseL - summedPartijen.scoreL)),
      right: Math.max(0, Math.trunc(restoredBaseR - summedPartijen.scoreR)),
    };
  }

  if (restoredKruisL !== null && restoredKruisR !== null) {
    kruisOffsetTotals.value = {
      left: Math.max(0, Math.trunc(restoredKruisL - summedPartijen.kruisL)),
      right: Math.max(0, Math.trunc(restoredKruisR - summedPartijen.kruisR)),
    };
  }

  partijen.value = restoredPartijen;
  lastSubmittedWasFinal.value = Boolean(entry?.isFinal);

  const lastTroefTeam = ["L", "R"].includes(entry?.lastTroefTeam)
    ? entry.lastTroefTeam
    : getLastTroefTeam();
  const nextTroefTeam = lastTroefTeam === "L" ? "R" : lastTroefTeam === "R" ? "L" : null;
  resetCurrentPartij(nextTroefTeam);
  setMessage(`Bestaande invoer geladen (${restoredPartijen.length} partijen).`, "info");
  return true;
}

async function restoreExistingSubmission() {
  if (!tournamentId) {
    return;
  }

  try {
    const apiBase = resolveApiBaseUrl();
    const url = new URL(`${String(apiBase).replace(/\/$/, "")}/score-forms/submissions`);
    url.searchParams.set("tournamentId", String(tournamentId));

    const response = await fetch(url.toString());
    if (!response.ok) {
      return;
    }

    const entries = await response.json();
    if (!Array.isArray(entries)) {
      return;
    }

    const latest = getLatestMatchSubmission(entries);
    if (!latest) {
      return;
    }

    applyRestoredSubmission(latest);
  } catch (error) {
    console.warn("Kon bestaande score-invoer niet herstellen:", error?.message || error);
  }
}

onMounted(() => {
  restoreExistingSubmission();
});
</script>

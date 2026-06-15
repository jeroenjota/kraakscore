<template>
  <div class="rounded-lg border border-blue-200 bg-white/90 p-3">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-base font-semibold text-blue-900">Online score</h3>
      <div class="inline-flex gap-2 rounded-lg border border-sky-300 bg-transparent p-1 shadow-sm">
        <button
          type="button"
          class="relative min-w-[50px] rounded-lg border border-sky-600 px-1 py-0.5 text-xs font-medium transition"
          :class="submitMode === 'immediate' ? 'bg-sky-600 text-white' : 'text-sky-900 hover:bg-sky-50'"
          @click="emit('update:submitMode', 'immediate')"
        >
          Live
        </button>
        <button
          type="button"
          class="relative min-w-[50px] rounded-full border border-sky-600 px-1 py-0.5 text-xs font-medium transition"
          :class="submitMode === 'final' ? 'bg-sky-600 text-white' : 'text-sky-900 hover:bg-sky-50'"
          @click="emit('update:submitMode', 'final')"
        >
          Eind
        </button>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="selectedRoundVisible"
        :disabled="!selectedRound"
        class="inline-flex items-center gap-2 rounded-full border border-blue-300 px-2 py-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        :class="selectedRoundVisible ? 'bg-sky-100 text-sky-900' : 'bg-gray-100 text-gray-700'"
        @click="toggleSelectedRoundVisibility"
      >
        <span
          class="relative inline-flex h-5 w-9 items-center rounded-full transition"
          :class="selectedRoundVisible ? 'bg-sky-600' : 'bg-gray-400'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"
            :class="selectedRoundVisible ? 'translate-x-4' : 'translate-x-0.5'"
          />
        </span>
        <span>Links {{ selectedRoundVisible ? "" : "" }}</span>
      </button>
      <label v-if="selectedRoundVisible" class="inline-flex items-center gap-2 text-sm">
        <span>voor</span>
        <select
          class="rounded border border-blue-300 px-2 py-1"
          :value="selectedRound"
          :disabled="roundOptions.length === 0"
          @change="onRoundChange"
        >
          <option v-for="option in roundOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <!-- <p class="mb-2 text-xs text-gray-700">
      Papier blijft altijd bruikbaar: dit is een extra invoermethode naast handmatige invoer in de centrale app.
    </p> -->

    <div class="max-h-64 space-y-2 overflow-y-auto pr-1">
      <template v-if="hasGroupTournament && selectedRoundVisible">
        <div v-if="selectedGroupRoundEntries" class="rounded border border-gray-200 p-2">
          <div>
            <div v-for="entry in selectedGroupRoundEntries.groupA" :key="entry.id" class="mb-2 rounded border border-gray-100 p-2 last:mb-0">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="text-sm">
                  <span class="text-blue-800">{{ entry.label }}</span>
                  <strong class="text-gray-900"> - {{ entry.teamL }} vs {{ entry.teamR }}</strong>
                </div>
                <div class="flex items-center gap-2">
                  <button class="rounded bg-sky-600 px-2 py-1 text-xs text-white" @click="openQr(entry)">
                    QR
                  </button>
                  <button class="rounded bg-gray-100 px-2 py-1 text-xs" @click="copyLink(entry.url)">
                    Kopieer link
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 border-t border-gray-700 pt-0">
            <div v-for="entry in selectedGroupRoundEntries.groupB" :key="entry.id" class="mb-2 rounded border border-gray-100 p-2 last:mb-0">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="text-sm">
                  <span class="text-blue-800">{{ entry.label }}</span>
                  <strong class="text-gray-900"> - {{ entry.teamL }} vs {{ entry.teamR }}</strong>
                </div>
                <div class="flex items-center gap-2">
                  <button class="rounded bg-sky-600 px-2 py-1 text-xs text-white" @click="openQr(entry)">
                    QR
                  </button>
                  <button class="rounded bg-gray-100 px-2 py-1 text-xs" @click="copyLink(entry.url)">
                    Kopieer link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="selectedFinalEntries.length > 0" class="rounded border border-gray-200 p-2">
          <div v-for="entry in selectedFinalEntries" :key="entry.id" class="mb-2 rounded border border-gray-100 p-2 last:mb-0">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="text-sm">
                <span class="text-blue-800">{{ entry.label }}</span>
                <strong class="text-gray-900"> - {{ entry.teamL }} vs {{ entry.teamR }}</strong>
              </div>
              <div class="flex items-center gap-2">
                <button class="rounded bg-sky-600 px-2 py-1 text-xs text-white" @click="openQr(entry)">
                  QR
                </button>
                <button class="rounded bg-gray-100 px-2 py-1 text-xs" @click="copyLink(entry.url)">
                  Kopieer link
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="displayedFormEntries.length > 0" v-for="entry in displayedFormEntries" :key="entry.id" class="rounded border border-gray-200 p-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-sm">
            <strong>{{ entry.label }}</strong>
            <span class="text-gray-900"> - {{ entry.teamL }} vs {{ entry.teamR }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="rounded bg-sky-600 px-2 py-1 text-xs text-white" @click="openQr(entry)">
              QR
            </button>
            <button class="rounded bg-gray-100 px-2 py-1 text-xs" @click="copyLink(entry.url)">
              Kopieer link
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tournamentId" class="mt-3 flex flex-row items-center justify-center gap-1">
      <button
        type="button"
        class="rounded border border-sky-600 bg-white px-3 py-1 text-xs text-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="manualRefreshInProgress"
        @click="emit('refreshOnlineScores')"
      >
        {{ manualRefreshInProgress ? "Verversen..." : "Ververs online scores" }}
      </button>
      <span v-if="manualRefreshStatus" class="text-center text-xs text-gray-600">{{ manualRefreshStatus }}</span>
    </div>

    <div v-if="qrEntry" class="fixed inset-0 z-40 bg-[rgba(0,0,0,0.45)]" @click.self="closeQr">
      <div class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeQr">
        <div class="relative w-[320px] rounded border border-gray-300 bg-white p-4 shadow-lg">
          <button class="absolute right-2 top-1 text-xl text-gray-500 hover:text-black" @click="closeQr">x</button>
          <h4 class="mb-2 text-sm font-semibold">{{ qrEntry.label }}</h4>
          <qrcode-vue :value="qrEntry.url" :size="180" class="mx-auto" />
          <p class="mt-2 text-center text-xs text-gray-500">Scan om scoreformulier te openen</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import QrcodeVue from "qrcode.vue";

const props = defineProps({
  submitMode: {
    type: String,
    default: "immediate",
  },
  tournamentId: {
    type: [Number, String],
    default: null,
  },
  tournamentDate: {
    type: [Date, String],
    default: null,
  },
  scoreTarget: {
    type: Number,
    default: 1500,
  },
  winnerKruis: {
    type: Number,
    default: 4,
  },
  groups: {
    type: Array,
    default: () => [],
  },
  matches: {
    type: Array,
    default: () => [],
  },
  groupMatches: {
    type: Array,
    default: () => [],
  },
  finalMatches: {
    type: Array,
    default: () => [],
  },
  manualRefreshInProgress: {
    type: Boolean,
    default: false,
  },
  manualRefreshStatus: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:submitMode", "refreshOnlineScores"]);

const qrEntry = ref(null);
const selectedRound = ref("");
const roundVisibility = ref({});
const hasGroupTournament = computed(() => Array.isArray(props.groupMatches) && props.groupMatches.length > 0);

const baseUrl = computed(() => {
  if (typeof window === "undefined") return "";
  return new URL(`${import.meta.env.BASE_URL}score-entry.html`, window.location.origin).toString();
});

function buildUrl(payload) {
  const params = new URLSearchParams();
  params.set("tid", String(props.tournamentId ?? ""));
  if (props.tournamentDate) {
    const isoDate = new Date(props.tournamentDate).toISOString();
    params.set("date", isoDate);
  }
  params.set("mode", props.submitMode || "immediate");
  params.set("scoreTarget", String(props.scoreTarget ?? ""));
  params.set("winnerKruis", String(props.winnerKruis ?? ""));

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.set(key, String(value));
  });

  return `${baseUrl.value}?${params.toString()}`;
}

const formEntries = computed(() => {
  const entries = [];

  if (Array.isArray(props.groupMatches) && props.groupMatches.length > 0) {
    props.groupMatches.forEach((groupRounds, groupIndex) => {
      const groupName = groupIndex === 0 ? "A" : "B";
      groupRounds.forEach((roundMatches, roundIndex) => {
        roundMatches.forEach((match, matchIndex) => {
          entries.push({
            id: `group-${groupName}-${roundIndex}-${matchIndex}`,
            label: `Grp ${groupName} - Rnd ${roundIndex + 1} - Tafel ${match.tafel}`,
            roundKey: `group-${groupName}-${roundIndex + 1}`,
            roundLabel: `Grp ${groupName} - Rnd ${roundIndex + 1}`,
            groupName,
            roundNumber: roundIndex + 1,
            tableNumber: match.tafel,
            teamL: match.teamL,
            teamR: match.teamR,
            url: buildUrl({
              mt: "group",
              group: groupName,
              round: roundIndex + 1,
              table: match.tafel,
              mi: matchIndex,
              teamL: match.teamL,
              teamR: match.teamR,
              startScoreL: match.scoreL ?? 0,
              startScoreR: match.scoreR ?? 0,
              startKruisL: match.kruisL ?? 0,
              startKruisR: match.kruisR ?? 0,
              lastTroefTeam: match.lastTroefTeam ?? "",
            }),
          });
        });
      });
    });
  } else {
    props.matches.forEach((roundMatches, roundIndex) => {
      roundMatches.forEach((match, matchIndex) => {
        entries.push({
          id: `single-${roundIndex}-${matchIndex}`,
          label: `Ronde ${roundIndex + 1} - Tafel ${match.tafel}`,
          roundKey: `single-${roundIndex + 1}`,
          roundLabel: `Ronde ${roundIndex + 1}`,
          teamL: match.teamL,
          teamR: match.teamR,
          url: buildUrl({
            mt: "single",
            round: roundIndex + 1,
            table: match.tafel,
            mi: matchIndex,
            teamL: match.teamL,
            teamR: match.teamR,
            startScoreL: match.scoreL ?? 0,
            startScoreR: match.scoreR ?? 0,
            startKruisL: match.kruisL ?? 0,
            startKruisR: match.kruisR ?? 0,
            lastTroefTeam: match.lastTroefTeam ?? "",
          }),
        });
      });
    });
  }

  props.finalMatches.forEach((match, index) => {
    if (!match?.teamL || !match?.teamR) return;
    entries.push({
      id: `final-${index}`,
      label: `Finale/plaatsing ${match.pl} - Tafel ${match.tafel}`,
      roundKey: "finales",
      roundLabel: "Finales",
      teamL: match.teamL,
      teamR: match.teamR,
      url: buildUrl({
        mt: "final",
        round: "finales",
        table: match.tafel,
        fi: index,
        place: match.pl,
        teamL: match.teamL,
        teamR: match.teamR,
        startScoreL: match.scoreL ?? 0,
        startScoreR: match.scoreR ?? 0,
        startKruisL: match.kruisL ?? 0,
        startKruisR: match.kruisR ?? 0,
        lastTroefTeam: match.lastTroefTeam ?? "",
      }),
    });
  });

  return entries;
});

const roundOptions = computed(() => {
  const options = [];

  if (hasGroupTournament.value) {
    const roundCount = Math.min(
      props.groupMatches?.[0]?.length ?? 0,
      props.groupMatches?.[1]?.length ?? 0,
    );
    for (let roundNumber = 1; roundNumber <= roundCount; roundNumber += 1) {
      options.push({
        value: String(roundNumber),
        label: `Ronde ${roundNumber}`,
      });
    }
    if (props.finalMatches.some((match) => match?.teamL && match?.teamR)) {
      options.push({
        value: "finales",
        label: "Finales",
      });
    }
    return options;
  }

  const seen = new Set();

  formEntries.value.forEach((entry) => {
    if (!entry.roundKey || seen.has(entry.roundKey)) return;
    seen.add(entry.roundKey);
    options.push({
      value: entry.roundKey,
      label: entry.roundLabel || entry.roundKey,
    });
  });

  return options;
});

const selectedGroupRoundEntries = computed(() => {
  if (!hasGroupTournament.value || !selectedRound.value) return null;

  const roundNumber = Number(selectedRound.value);
  if (!Number.isFinite(roundNumber) || roundNumber <= 0) return null;

  const roundEntries = formEntries.value.filter(
    (entry) => entry.roundNumber === roundNumber,
  );

  return {
    roundNumber,
    groupA: roundEntries.filter((entry) => entry.groupName === "A"),
    groupB: roundEntries.filter((entry) => entry.groupName === "B"),
  };
});

const selectedFinalEntries = computed(() => {
  if (!hasGroupTournament.value || selectedRound.value !== "finales") {
    return [];
  }

  return formEntries.value.filter((entry) => entry.roundKey === "finales");
});

const selectedRoundEntries = computed(() => {
  if (!selectedRound.value) return [];
  return formEntries.value.filter((entry) => entry.roundKey === selectedRound.value);
});

const selectedRoundVisible = computed(() => {
  if (!selectedRound.value) return false;
  return roundVisibility.value[selectedRound.value] !== false;
});

const displayedFormEntries = computed(() => {
  if (hasGroupTournament.value) return [];
  if (!selectedRoundVisible.value) return [];
  return selectedRoundEntries.value;
});

watch(roundOptions, (options) => {
  const nextVisibility = {};
  options.forEach((option) => {
    nextVisibility[option.value] = roundVisibility.value[option.value] !== false;
  });
  roundVisibility.value = nextVisibility;

  if (!options.some((option) => option.value === selectedRound.value)) {
    selectedRound.value = options[0]?.value || "";
  }
}, { immediate: true });

function onRoundChange(event) {
  selectedRound.value = event.target.value;
}

function toggleSelectedRoundVisibility() {
  if (!selectedRound.value) return;
  const current = roundVisibility.value[selectedRound.value] !== false;
  roundVisibility.value = {
    ...roundVisibility.value,
    [selectedRound.value]: !current,
  };
}

function openQr(entry) {
  qrEntry.value = entry;
}

function closeQr() {
  qrEntry.value = null;
}

async function copyLink(link) {
  try {
    await navigator.clipboard.writeText(link);
    alert("Link gekopieerd naar klembord");
  } catch {
    alert("Kopieren mislukt");
  }
}
</script>
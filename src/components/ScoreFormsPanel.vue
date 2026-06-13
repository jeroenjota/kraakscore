<template>
  <div class="rounded border border-blue-200 bg-white/90 p-3">
    <div class="mb-2 flex flex-wrap items-center gap-3">
      <h3 class="text-base font-semibold text-blue-900">Online score</h3>
      <button
        type="button"
        role="switch"
        :aria-checked="submitMode === 'immediate'"
        class="inline-flex items-center gap-2 rounded-full border border-blue-300 px-2 py-1 text-sm transition"
        :class="submitMode === 'immediate' ? 'bg-sky-100 text-sky-900' : 'bg-gray-100 text-gray-700'"
        @click="toggleSubmitMode"
      >
        <span
          class="relative inline-flex h-5 w-9 items-center rounded-full transition"
          :class="submitMode === 'immediate' ? 'bg-sky-600' : 'bg-gray-400'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"
            :class="submitMode === 'immediate' ? 'translate-x-4' : 'translate-x-0.5'"
          />
        </span>
        <span>{{ submitMode === "immediate" ? "Live" : "Na afloop partij" }}</span>
      </button>
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
        <span>Score link {{ selectedRoundVisible ? "" : "" }}</span>
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
      <div v-for="entry in displayedFormEntries" :key="entry.id" class="rounded border border-gray-200 p-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-sm">
            <strong>{{ entry.label }}</strong>
            <span class="text-gray-600"> - {{ entry.teamL }} vs {{ entry.teamR }}</span>
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
        <p class="mt-1 break-all text-xs text-gray-500">{{ entry.url }}</p>
      </div>
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
});

const emit = defineEmits(["update:submitMode"]);

const qrEntry = ref(null);
const selectedRound = ref("");
const roundVisibility = ref({});

const baseUrl = computed(() => {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.host}/score-entry.html`;
});

function buildUrl(payload) {
  const params = new URLSearchParams();
  params.set("tid", String(props.tournamentId ?? ""));
  if (props.tournamentDate) {
    const isoDate = new Date(props.tournamentDate).toISOString();
    params.set("date", isoDate);
  }
  params.set("mode", props.submitMode || "immediate");

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
            label: `Groep ${groupName} - Ronde ${roundIndex + 1} - Tafel ${match.tafel}`,
            roundKey: `group-${groupName}-${roundIndex + 1}`,
            roundLabel: `Groep ${groupName} - Ronde ${roundIndex + 1}`,
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
      }),
    });
  });

  return entries;
});

const roundOptions = computed(() => {
  const options = [];
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

const selectedRoundEntries = computed(() => {
  if (!selectedRound.value) return [];
  return formEntries.value.filter((entry) => entry.roundKey === selectedRound.value);
});

const selectedRoundVisible = computed(() => {
  if (!selectedRound.value) return false;
  return roundVisibility.value[selectedRound.value] !== false;
});

const displayedFormEntries = computed(() => {
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

function toggleSubmitMode() {
  const nextMode = props.submitMode === "immediate" ? "final" : "immediate";
  emit("update:submitMode", nextMode);
}

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
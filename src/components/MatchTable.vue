<template>

  <table class="rondes table w-full" :id="matchType">
    <tbody>
      <tr v-for="(match, index) in matches" :key="index">
        <td
          style="width:9%; text-align: center;"
          class="border"
          :class="canShowQrForMatch(match) ? 'p-0' : 'px-2'">
          <div class="match-header-cell">
            <button
              v-if="canShowQrForMatch(match)"
              type="button"
              class="match-header-qr-btn"
              v-tooltip="'Open QR-code en scan met telefoon'"
              @click="openQrForMatch(match, index)">
              <span v-if="!matchType">T {{ match.tafel }}</span>
              <span v-else>Pl {{ match.pl }}</span>
              <svg
                class="match-header-qr-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false">
                <path
                  fill="currentColor"
                  d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8 0h2v2h-2v-2Zm2 2h2v2h-2v-2Zm-2 2h2v2h-2v-2Zm4-4h4v2h-4v-2Zm2 2h2v4h-2v-4Zm-2 2h2v2h-2v-2Z" />
              </svg>
            </button>
            <span v-else-if="!matchType">T {{ match.tafel }}</span>
            <span v-else>Pl {{ match.pl }}</span>
          </div>
        </td>
        <td style="width:23%; text-align: left;" class="border px-2 text-sm sm:text-lg">{{ match.teamL }}</td>
        <td style="width:5%; text-align: center;" class="border px-2">vs</td>
        <td style="width:23%; text-align: left;" class="border px-2 text-sm sm:text-lg">{{ match.teamR }}</td>
        <td style="width:15%; text-align: left;" class="border px-2">
          <input style="width:100%; margin:0" type="number" v-model.number="scores[index].scoreL" min="0" step="10"
            :disabled="!editMode || hasVRIJ(index)"
            @change="update(index)" @keypress="blokkeerLetters"/>

        </td>
        <td style="width:3%; text-align: center;" class="border px-2">-</td>
        <td style="width:15%; text-align: left;" class="border px-2">
          <input style="width:100%; margin:0" type="number" v-model.number="scores[index].scoreR" min="0" step="10"
            @change="update(index)" @keypress="blokkeerLetters" :disabled="!editMode || hasVRIJ(index)"/>
        </td>
      </tr>
    </tbody>
  </table>

  <div
    v-if="qrEntry"
    class="fixed inset-0 z-40 bg-[rgba(0,0,0,0.45)]"
    @click.self="closeQr">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeQr">
      <div
        class="relative w-[320px] rounded border border-gray-300 bg-white p-4 shadow-lg"
        @click.stop="copyQrLinkToClipboard">
        <button
          class="absolute right-2 top-1 text-xl text-gray-500 hover:text-black"
          @click.stop="closeQr">
          x
        </button>
        <h4 class="mb-2 text-center text-sm font-semibold">{{ qrEntry.roundLabel }}, {{ qrEntry.label }}</h4>
        <!-- <p class="mb-1 text-center text-xs text-gray-600">{{ qrEntry.roundLabel }}</p> -->
        <p class="mb-2 text-center text-xs text-gray-700">{{ qrEntry.teamL }} vs {{ qrEntry.teamR }}</p>
        <qrcode-vue :value="qrEntry.url" :size="180" class="mx-auto" />
        <!-- <p class="mt-2 text-center text-xs text-gray-500">
          Klik in dit venster om link te kopieren
        </p> -->
        <p v-if="qrCopyFeedback" class="mt-1 text-center text-xs text-emerald-700">
          {{ qrCopyFeedback }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useInputFilters } from '../composables/useInputFilters';
import dbService from '../services/dbServices';
import QrcodeVue from 'qrcode.vue';


const { blokkeerLetters } = useInputFilters();

const props = defineProps({
  matches: Array,
  teams: Array,
  tournamentId: {
    type: [Number, String],
    default: null,
  },
  tournamentDate: {
    type: [Date, String],
    default: null,
  },
  round: {
    type: [Number, String],
    default: null,
  },
  group: {
    type: String,
    default: null,
  },
  matchType: {
    type: String,
  },
  submitMode: {
    type: String,
    default: 'immediate',
  },
  scoreTarget: {
    type: Number,
    default: 2000,
  },
  winnerKruis: {
    type: Number,
    default: 4,
  },
  showOnlineScoreQr: {
    type: Boolean,
    default: false,
  },
  finalIndex: {
    type: Number,
    default: null,
  },
  editMode: {
    type: Boolean
  }

})


// console.log('Edit mode in MatchTable:', editMode);

const emit = defineEmits(['update-result'])

const scores = ref([])
const qrEntry = ref(null)
const qrCopyFeedback = ref('')
let qrCopyFeedbackTimer = null

const scoreEntryBaseUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return new URL(
    `${import.meta.env.BASE_URL}score-entry.html`,
    window.location.origin,
  ).toString()
})

// console.log('Edit mode in MatchTable:', props.editMode);

watch(
  () => props.matches,
  (nextMatches) => {
    const safeMatches = Array.isArray(nextMatches) ? nextMatches : []
    scores.value = safeMatches.map((match) => ({
      tafel: (match?.tafel ?? 1) - 1,
      scoreL: match?.scoreL ?? '',
      scoreR: match?.scoreR ?? ''
    }))
  },
  { immediate: true, deep: true }
)

function hasVRIJ(match){
  let VRIJ = props.matches[match].teamL === "VRIJ" ||  props.matches[match].teamR === "VRIJ"
  return VRIJ
}

function canShowQrForMatch(match) {
  return Boolean(
    props.showOnlineScoreQr &&
    scoreEntryBaseUrl.value &&
    match?.teamL &&
    match?.teamR &&
    match.teamL !== 'VRIJ' &&
    match.teamR !== 'VRIJ',
  )
}

async function buildScoreEntryUrl(match, index) {
  if (!scoreEntryBaseUrl.value) return ''

  const params = new URLSearchParams()
  params.set('tid', String(props.tournamentId ?? ''))

  if (props.tournamentDate) {
    const isoDate = new Date(props.tournamentDate).toISOString()
    params.set('date', isoDate)
  }

  params.set('mode', props.submitMode || 'immediate')
  params.set('scoreTarget', String(props.scoreTarget ?? 2000))
  params.set('winnerKruis', String(props.winnerKruis ?? 4))

  const isFinal = props.group === 'finales' || Boolean(props.matchType)
  const matchType = isFinal ? 'final' : props.group === 'A' || props.group === 'B' ? 'group' : 'single'

  params.set('mt', matchType)
  if (props.group) params.set('group', String(props.group))
  if (props.round !== null && props.round !== undefined) {
    params.set('round', String(props.round))
  }
  if (match?.tafel !== null && match?.tafel !== undefined) {
    params.set('table', String(match.tafel))
  }
  if (match?.teamL) params.set('teamL', String(match.teamL))
  if (match?.teamR) params.set('teamR', String(match.teamR))
  params.set('startScoreL', String(match?.scoreL ?? 0))
  params.set('startScoreR', String(match?.scoreR ?? 0))
  params.set('startKruisL', String(match?.kruisL ?? 0))
  params.set('startKruisR', String(match?.kruisR ?? 0))
  params.set('lastTroefTeam', String(match?.lastTroefTeam ?? ''))

  if (isFinal) {
    params.set('fi', String(props.finalIndex ?? index))
    if (match?.pl !== null && match?.pl !== undefined) {
      params.set('place', String(match.pl))
    }
  } else {
    params.set('mi', String(index))
  }

  try {
    const tokenResponse = await dbService.createScoreFormToken({
      tournamentId: props.tournamentId ?? null,
      tournamentDate: props.tournamentDate ? new Date(props.tournamentDate).toISOString() : null,
      mode: props.submitMode || 'immediate',
      matchType,
      group: props.group ?? null,
      round: props.round ?? null,
      table: match?.tafel ?? null,
      matchIndex: isFinal ? null : index,
      finalIndex: isFinal ? (props.finalIndex ?? index) : null,
      place: isFinal && match?.pl !== null && match?.pl !== undefined ? String(match.pl) : null,
      teamL: match?.teamL ?? null,
      teamR: match?.teamR ?? null,
    })

    if (tokenResponse?.success && tokenResponse?.data?.token) {
      params.set('token', tokenResponse.data.token)
    }
  } catch (error) {
    console.warn('Kon scoreformulier-token niet aanmaken:', error?.message || error)
  }

  return `${scoreEntryBaseUrl.value}?${params.toString()}`
}

async function openQrForMatch(match, index) {
  const url = await buildScoreEntryUrl(match, index)
  if (!url) return

  const isFinal = props.group === 'finales' || Boolean(props.matchType)
  const roundLabel = isFinal
    ? 'Ronde: Finales'
    : `Ronde ${props.round ?? '-'}`

  const label = !props.matchType
    ? `Tafel ${match?.tafel ?? index + 1}`
    : `Plaats ${match?.pl ?? '-'} - Tafel ${match?.tafel ?? index + 1}`

  qrEntry.value = {
    label,
    roundLabel,
    teamL: match?.teamL ?? '-',
    teamR: match?.teamR ?? '-',
    url,
  }
  qrCopyFeedback.value = ''
}

function closeQr() {
  qrEntry.value = null
  qrCopyFeedback.value = ''
  if (qrCopyFeedbackTimer) {
    clearTimeout(qrCopyFeedbackTimer)
    qrCopyFeedbackTimer = null
  }
}

async function copyQrLinkToClipboard() {
  const link = qrEntry.value?.url
  if (!link) return

  try {
    await navigator.clipboard.writeText(link)
    qrCopyFeedback.value = 'Link gekopieerd naar klembord'
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = link
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      qrCopyFeedback.value = ok
        ? 'Link gekopieerd naar klembord'
        : 'Kopieren mislukt'
    } catch {
      qrCopyFeedback.value = 'Kopieren mislukt'
    }
  }

  if (qrCopyFeedbackTimer) {
    clearTimeout(qrCopyFeedbackTimer)
  }
  qrCopyFeedbackTimer = setTimeout(() => {
    qrCopyFeedback.value = ''
  }, 1800)
}

function update(index) {
  // console.log("update index:", index, "scores:", scores.value)
  const { scoreL, scoreR } = scores.value[index]
  if (scoreL !== '' && scoreR !== '') {
    const match = props.matches[index] ?? {}
    const isFinalMatch = props.group === 'finales' || Boolean(props.matchType)
    const oldScoreL = Number(match.scoreL ?? 0)
    const oldScoreR = Number(match.scoreR ?? 0)
    const newScoreL = Number(scoreL)
    const newScoreR = Number(scoreR)

    let actionType = 'unchanged'
    if (newScoreL === 0 && newScoreR === 0 && (oldScoreL !== 0 || oldScoreR !== 0)) {
      actionType = 'clear'
    } else if (oldScoreL === 0 && oldScoreR === 0 && (newScoreL !== 0 || newScoreR !== 0)) {
      actionType = 'create'
    } else if (oldScoreL !== newScoreL || oldScoreR !== newScoreR) {
      actionType = 'update'
    }

    dbService.logScoreEntry({
      tournamentId: props.tournamentId,
      tournamentDate: props.tournamentDate
        ? new Date(props.tournamentDate).toISOString()
        : null,
      round: props.round,
      group: props.group,
      matchType: props.matchType ?? 'group',
      table: match.tafel ?? null,
      matchIndex: isFinalMatch ? null : index,
      finalIndex: isFinalMatch ? (props.finalIndex ?? index) : null,
      place: match.pl ?? null,
      teamL: match.teamL ?? null,
      teamR: match.teamR ?? null,
      oldScoreL,
      oldScoreR,
      scoreL: newScoreL,
      scoreR: newScoreR,
      actionType,
    })
    emit('update-result', index, newScoreL, newScoreR)
  }
}
onMounted(() => {
 // console.log("MatchTable mounted with matches:", props.matches)
})
</script>

<style scoped>
.match-header-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.match-header-qr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  width: 100%;
  min-height: 2.2rem;
  border: 0;
  background: transparent;
  color: #0369a1;
  padding: 0.35rem 0.2rem;
  /* font-size: 0.85rem;
  font-weight: 700;
  line-height: 1;
  padding: 0;
  text-decoration: underline; */
  cursor: pointer;
}

.match-header-qr-btn:hover {
  color: #0c4a6e;
}

.match-header-qr-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex: 0 0 auto;
}
</style>

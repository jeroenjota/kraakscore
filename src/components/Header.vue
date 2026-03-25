<template>
  <div class="kop">
    <div class="titelregel flex items-center justify-between">
      <h1
        class="text-2xl font-bold"
        @click="$emit('toggleZoom')"
        v-tooltip="{ content: 'Klik om in/uit te zoomen', html: true }">
        <span v-if="thisToernooiID">Kraaktoernooi</span>
        <span v-else>
          <span class="boom">Laurierboom Kraak</span>
        </span>
      </h1>
      <div
        v-if="!thisToernooiID && !tournamentStarted && serverAvailable"
        class="items-center">
        <button
          @click="$emit('toggleShowRanking')"
          class="mr-0 mt-2 rounded bg-blue-800 p-2 px-2 text-white">
          <span v-if="!showRanking"
            ><span
              v-tooltip="'Toon de ranking tot en met het laatste toernooi'"
              >Seizoen</span
            ></span
          >
          <span v-else
            ><span v-tooltip="'Terug naar hoofdscherm'">Terug</span></span
          >
        </button>
        <select
          @change="$emit('setPeriode')"
          class="m-1 rounded border bg-white p-1"
          name="semester"
          id="semester"
          v-model="localCurrentSemester">
          <option
            v-for="semester in semesters"
            :key="semester"
            :value="semester">
            {{ semester }}
          </option>
        </select>
        <select
          id="toernooien"
          v-model="localSelectToernooi"
          class="m-1 rounded border bg-white p-1"
          v-tooltip="{
            content: 'Selecteer een opgeslagen toernooi',
            html: true,
          }"
          @change="$emit('handleSelectTournament')">
          <option value="Toernooien" disabled>Toernooien</option>
          <option
            v-for="(tn, tnindex) in filteredToernooien"
            :key="tnindex"
            :value="tn">
            {{ niceDate(tn.datum, true) }}
          </option>
        </select>
      </div>
      <div
        v-if="selectToernooi !== 'Toernooien'"
        class="titel regel justify-left flex">
        <h2 class="m-1 text-sm text-white">
          Datum: {{ niceDate(thisToernooiDatum) }}
        </h2>

        <button
          v-if="!editMode"
          v-tooltip="'Bewerk dit toernooi'"
          class="border-0 bg-transparent p-1"
          @click="$emit('toggleEditMode')">
          <PencilSquareIcon class="h-6 w-6 text-blue-100" />
        </button>
        <button
          v-if="editMode"
          v-tooltip="'Sla dit toernooi op'"
          class="border-0 bg-transparent p-1"
          @click="$emit('saveTournamentChanges')">
          <InboxIcon class="h-6 w-6 text-green-300" />
        </button>
        <button
          v-if="serverAvailable"
          class="border-0 bg-red-800 p-1"
          @click.ctrl="$emit('removeTournament', selectToernooi)"
          v-tooltip="{
            content:
              'Verwijder dit toernooi definitief van de server 😳 <br/>(Alleen met ctrl+click)',
            html: true,
          }">
          <TrashIcon class="h-6 w-6 text-red-200" />
        </button>
      </div>
      <div class="knoppen flex justify-center" v-if="tournamentStarted">
        <button @click="$emit('sluitToernooi')" class="btn bg-yellow-300 text-red-800">
          <span
            v-if="thisToernooiID || !scoresEntered"
            v-tooltip="'Terug naar hoofdscherm'"
            >{{ sluitKnop }}</span
          ><span v-else v-tooltip="'Sla toernooi op'">{{ sluitKnop }}</span>
        </button>
        <button
          @click="$emit('maakPdf')"
          class="btn bg-blue-500 text-white"
          v-tooltip="'Toon de stand als PDF'">
          <PrinterIcon class="h-6 w-6 text-white" />
        </button>
        <!-- QR knop -->
        <Qrcode v-if="pdfUrl" :pdfUrl="pdfUrl" />
        <button
          v-if="pdfUrl"
          class="btn bg-green-400 text-red-800"
          v-tooltip="{
            content: `Stuur een link naar de PDF met WhatsApp <br/>(Mits web-versie geïnstalleerd): ${pdfUrl}`,
            html: true,
          }">
          <a
            :href="`https://wa.me/?text=Bekijk de toernooiuitslag ${niceDate(
              thisToernooiDatum,
            )}: ${encodeURIComponent(pdfUrl)}`"
            target="_blank">
            <img
              height="24"
              width="24"
              src="https://unpkg.com/simple-icons@latest/icons/whatsapp.svg" />
          </a>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { niceDate } from "../utils/dateUtils.js";
import Qrcode from "./Qrcode.vue";
import {
  PrinterIcon,
  TrashIcon,
  PencilSquareIcon,
  InboxIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps({
  thisToernooiID: [Number, String, null],
  tournamentStarted: Boolean,
  serverAvailable: Boolean,
  showRanking: Boolean,
  currentSemester: String,
  selectToernooi: [Object, String],
  filteredToernooien: Array,
  semesters: Array,
  editMode: Boolean,
  thisToernooiDatum: [Date, String],
  pdfUrl: [String, null],
  sluitKnop: String,
  scoresEntered: Boolean,
});

const emit = defineEmits([
  "toggleZoom",
  "toggleShowRanking",
  "setPeriode",
  "handleSelectTournament",
  "toggleEditMode",
  "saveTournamentChanges",
  "removeTournament",
  "sluitToernooi",
  "maakPdf",
  "update:currentSemester",
  "update:selectToernooi",
]);

const localCurrentSemester = computed({
  get: () => props.currentSemester,
  set: (val) => emit("update:currentSemester", val),
});

const localSelectToernooi = computed({
  get: () => props.selectToernooi,
  set: (val) => emit("update:selectToernooi", val),
});
</script>

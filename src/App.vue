<template>
  <ConfirmDialog ref="dialog" />
  <div
    class="maindiv app-scaled mx-auto max-w-4xl space-y-4 rounded"
    :style="zoomStyle">
    <Header
      v-if="!standOnlyView"
      :thisToernooiID="thisToernooiID"
      :tournamentStarted="tournamentStarted"
      :canUndoTournamentStart="canUndoTournamentStart"
      :serverAvailable="serverAvailable"
      :showRanking="showRanking"
      v-model:currentSemester="currentSemester"
      v-model:selectToernooi="selectToernooi"
      :filteredToernooien="filteredToernooien"
      :semesters="getSemesters()"
      :editMode="editMode"
      :thisToernooiDatum="thisToernooiDatum"
      :pdfUrl="pdfUrl"
      :sluitKnop="sluitKnop"
      :scoresEntered="scoresEntered"
      @toggleZoom="toggleZoom"
      @toggleShowRanking="toggleShowRanking"
      @setPeriode="setPeriode"
      @handleSelectTournament="handleSelectTournament"
      @toggleEditMode="toggleEditMode"
      @saveTournamentChanges="saveTournamentChanges"
      @removeTournament="removeTournament"
      @undoTournamentStart="undoTournamentStart"
      @sluitToernooi="sluitToernooi"
      @maakPdf="maakPdf" />
    <div class="toprow" v-if="!standOnlyView && !tournamentStarted">
      <!-- Lijst sectie -->
      <div v-if="showRanking" class="ranking">
        <Ranking
          :ranking="filteredRanking"
          :toernooien="filteredToernooien"
          :vanaf="vanaf"
          :tot="tot" />
      </div>

      <div v-if="!showRanking" class="teams">
        <div class="flex w-full flex-row gap-2 rounded">
          <SelectPlayers
            :spelers="spelers"
            :toernooiTeams="toernooiTeams"
            v-model:toernooiDatum="thisToernooiDatum"
            @addTeam="addTeam" />
        </div>
        <div
          class="flex items-center gap-2 rounded border p-1"
          v-tooltip="{ content: 'Alleen bij minder dan 7 teams', html: true }">
          <label class="text-start text-blue-700 sm:text-lg" for="repeatRounds"
            >Aantal volle rondes:</label
          >
          <input
            id="repeatRounds"
            type="number"
            v-model="repeatRounds"
            min="1"
            :max="toernooiTeams.length > 6 ? 1 : 2"
            class="w-12 rounded border p-2"
            style="width: 25%" />
        </div>
        <div class="flex gap-2 text-center">
          <div></div>
        </div>
        <div v-if="toernooiTeams.length > 0" class="teamlist">
          <h2
            class="font-semibold"
            @click.ctrl="removeTeamsFromToernooi"
            v-longpress="() => removeTeamsFromToernooi()">
            Lijst:
          </h2>
          <ul class="list-number list-outside" style="margin-left: 8px">
            <li
              v-for="(team, index) in toernooiTeams"
              :key="index"
              @click.exact="editTeam(index)"
              @click.ctrl="removeTeam(index)"
              v-longpress="() => removeTeam(index)">
              {{ index + 1 }}: {{ team }}
            </li>
          </ul>
          <p class="text-xs">Klik op team om te verwijderen</p>
        </div>
      </div>

      <!-- rechter div -->
      <!-- kan ofwel de standaard deelnemers lijst ofwel de stand laten zien -->
      <!-- Afhankelijk of er al dan niet al een schema is gemaakt -->
      <!-- AANPASSING Twee kolommen met spelers om de teams uit samen te stellen -->

      <div
        class="teamlijst"
        :class="{ 'teamlijst-collapsed': !showSavedTeamsList }">
        <!-- TODO Opties instellen -->
        <!-- 
        <div id="optionsForm" v-if="!tournamentStarted && !showRanking && !showSavedTeamsList">
          <h2
            @click="toggleShowOptions"
            class="cursor-pointer text-center text-lg text-blue-700">
            <span v-if="!showOptions">Toon opties</span>
            <span v-else>Verberg opties</span>
          </h2>
          <Options v-if="showOptions" />
         </div>
         -->
        <!-- Opgeslagen team lijst -->
        <div
          id="savedTeams"
          class="rounded"
          v-if="!tournamentStarted && !showRanking">
          <h2
            @click.exact="toggleSavedTeamsList"
            @click.ctrl="removeAllStandardTeams"
            class="cursor-pointer text-center text-lg text-blue-700">
            <span
              v-if="!showSavedTeamsList"
              v-tooltip="{ content: 'Toon opgeslagen teams', html: true }"
              >Selecteer teams &#x25BC;</span
            >
            <span v-else>Bestaande teams &#x25B2;</span>
            <!-- Bestaande teams {{ showSavedTeamsList ? "-" : "+" }} -->
          </h2>
          <div v-show="showSavedTeamsList" class="px-1 pb-1">
            <input
              ref="savedTeamsSearchRef"
              v-model="savedTeamsSearch"
              type="text"
              placeholder="Zoek team..."
              class="w-full rounded border border-blue-300 px-2 py-1 text-sm" />
          </div>
          <ul v-show="showSavedTeamsList" class="dbl">
            <li
              v-for="(tm, index) in filteredSavedTeams"
              :key="`${tm}-${index}`">
              <p
                @click.exact="selectSavedTeam(tm)"
                @click.ctrl="removeStandardTeam(tm)"
                v-longpress="() => removeStandardTeam(tm)"
                :class="{
                  teamSelected: teamSelected(tm),
                  teamDisabled:
                    !teamSelected(tm) && !availableTeams.includes(tm),
                }">
                <span v-if="teamSelected(tm)">&#10004;</span> {{ tm }}
              </p>
            </li>
          </ul>
          <div class="saved-teams-sticky-footer" v-show="showSavedTeamsList">
            <p class="text-xs">click: Meedoen, ctrl/long+click=Wissen</p>
            <button
              v-if="toernooiTeams.length === 0"
              class="border-t-black bg-sky-300 px-1 py-1 text-blue-800"
              @click="cleanDatabase">
              Teams opschonen
            </button>
          </div>
        </div>
        <button
          v-show="showSavedTeamsList"
          v-if="toernooiTeams.length > 3"
          @click="startTournament"
          class="saved-teams-start-btn rounded bg-green-800 px-2 py-2 text-white"
          style="margin-right: 2px; width: 200px"
          :disabled="tournamentStarted"
          v-tooltip="{
            content:
              'Maak het toernooischema <br/>Bij 8 teams worden willekeurig twee groepen aangemaakt',
            html: true,
          }">
          Start toernooi met {{ toernooiTeams.length }} teams
        </button>
      </div>
    </div>

    <Tournament
      v-if="tournamentStarted"
      :initialTeams="filteredTeams"
      :tournamentId="thisToernooiID"
      :tournamentDate="thisToernooiDatum"
      :repeatRounds="repeatRounds"
      :edit-mode="editMode"
      :standOnly="standOnlyView"
      :groepsToernooi="groepsToernooi"
      :toernooiPlayed="thisToernooiID !== null"
      @saveToernooi="saveTournament" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import Ranking from "./components/Ranking.vue";
import Tournament from "./components/Tournament.vue";
import Header from "./components/Header.vue";
import Options from "./components/Options.vue";

import SelectPlayers from "./components/SelectPlayers.vue";
// import Pdf from './components/Pdf.vue'
import { niceDate, getSemester, stripTime } from "./utils/dateUtils.js";
import longpress from "./directives/longpress.js";
import { useToast } from "vue-toastification";
import { getPdfUrl } from "./utils/pdfUtils.js";
import DOMPurify from "dompurify";
import { cleanTeamName } from "./utils/editUtils.js";
import { hasAnyScore } from "./utils/matchState.js";
// import dotenv from "dotenv";
// dotenv.config();

import dbService from "./services/dbServices.js";

import { useToastMessage } from "./composables/useToastMessage";

import ConfirmDialog from "./components/ConfirmDialog.vue";

import { registerConfirmDialog, useConfirm } from "./composables/useConfirm.js";

const dialog = ref(null);

const { toastHTML } = useToastMessage();

const scoresEntered = ref(false);

const sluitKnop = computed(() => {
  return scoresEntered.value && editMode.value ? "Opslaan" : "Sluiten";
});

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

let pdfDependenciesPromise = null;

async function loadPdfDependencies() {
  if (!pdfDependenciesPromise) {
    pdfDependenciesPromise = Promise.all([
      import("./utils/pdf/tournamentPDF.js"),
      import("./utils/pdf/rankingPDF.js"),
      import("jspdf"),
    ]).then(([tournamentPdfModule, rankingPdfModule, jspdfModule]) => {
      const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default;
      if (!jsPDF) {
        throw new Error("jsPDF kon niet worden geladen.");
      }

      return {
        jsPDF,
        uitslagPDF: tournamentPdfModule.uitslagPDF,
        rankingPDF: rankingPdfModule.rankingPDF,
      };
    });
  }

  return pdfDependenciesPromise;
}

const scale = ref(1);

const winScale = (width) => {
  if (width >= 1200) return 1;
  if (width >= 1000) return 0.9;
  if (width >= 800) return 0.8;
  return 0.7;
};

const zoomStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: "top left",
  width: `${100 / scale.value}%`,
  height: `${100 / scale.value}%`,
}));

const updateScale = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
  scale.value = winScale(windowWidth.value);
  // console.log("Window resized:", windowWidth.value, "Scale set to:", scale.value);
};

const toggleZoom = () => {
  scale.value -= 0.1;
  if (scale.value < 0.7) scale.value = 1;
};

const toast = useToast();
const showRanking = ref(false);
const rankingData = ref([]); // voor de ranking data
const filteredRanking = ref([]);
const serverAvailable = ref(false);
const toernooiSaved = ref(false); // om te weten of het toernooi is Opgeslagen
let instructions = "Voer een (nieuw) team (2 spelers met een spatie of zo) in";
instructions +=
  "<br/> en druk op enter (of klik OK)<br/>Of selecteer een bestaand team in de lijst rechts";
instructions += "<br/> Bij 4 of meer teams kan het toernooi worden gestart";

const groepsToernooi = ref(false); // boolean check groeps/single toernooi
const thisToernooiID = ref(null); // het huidige actieve toernooi
const thisToernooiDatum = ref(new Date()); // de datum van het huidige toernooi
const currentSemester = ref(""); // default value for semester selection
// const thisTNteams = ref([]) // teams van dit toernooi, nog niet gebruikt
const toernooien = ref([]); // array met alle opgeslagen toernooien
const spelers = ref([]); // alle spelers uit alle teams
const filteredToernooien = ref([]); // toernooien binnen een semester
const selectToernooi = ref("Toernooien"); // voor de DropDown met toernooien
const newTeam = ref(""); // voor het invulvak TeamNaam
const toernooiTeams = ref([]); // de teams in het huidige toernooi
const savedTeams = ref([]); // de opgeslagen teams in localStorage
const savedTeamsSearch = ref(""); // zoektekst voor de opgeslagen teams
const savedTeamsSearchRef = ref(null); // input ref voor focus op zoekvak
const showSavedTeamsList = ref(false); // inklapbare lijst met bestaande teams
const showOptions = ref(false); // boolean om opties te tonen of te verbergen
const editMode = ref(false); // boolean om edit mode aan te geven
const tournamentStarted = ref(false); // boolean om aan te geven of het toernooi gestart is
const standOnlyView = ref(
  typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "stand",
);
const repeatRounds = ref(1); // aantal herhalingen van de rondes in het huidige toernooi
const startUndoSnapshot = ref(null); // snapshot om toernooistart ongedaan te maken

const pdfUrl = ref(null); // URL van de PDF met uitslag van het huidige toernooi

const canUndoTournamentStart = computed(
  () => tournamentStarted.value && !!startUndoSnapshot.value,
);

const vanaf = ref(new Date().toISOString().split("T")[0]); // startdatum van de periode
const tot = ref(new Date().toISOString().split("T")[0]);

function toggleSavedTeamsList() {
  showSavedTeamsList.value = !showSavedTeamsList.value;
}

function toIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function logTournamentEvent(eventType, details = {}) {
  dbService.logTournamentEvent({
    eventType,
    tournamentId: thisToernooiID.value ?? null,
    tournamentDate: toIsoDate(thisToernooiDatum.value),
    actor: "frontend",
    details,
  });
}

async function selectSavedTeam(tm) {
  const wasSelected = toernooiTeams.value.includes(cleanTeamName(tm));
  getTeam(tm);
  const isSelected = toernooiTeams.value.includes(cleanTeamName(tm));
  logTournamentEvent("team_selection_toggled", {
    team: cleanTeamName(tm),
    actionType: isSelected ? "selected" : "deselected",
    wasSelected,
    selectedCount: toernooiTeams.value.length,
    source: "saved_team_list",
  });
  savedTeamsSearch.value = "";
  await nextTick();
  savedTeamsSearchRef.value?.focus();
}

watch(showSavedTeamsList, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  savedTeamsSearchRef.value?.focus();
});

function toggleShowOptions() {
  showOptions.value = !showOptions.value;
}

async function bevestig(kop, vraag, type, extra = {}) {
  await nextTick();
  // console.log("dialog:", dialog.value);

  if (!dialog.value) {
    console.error("ConfirmDialog component is not available.");
    return false;
  }
  const bevestigd = await dialog.value.open({
    title: kop,
    message: vraag,
    // icon: 'warning',
    confirmButtonText: "Ja",
    cancelButtonText: "Nee",
    icon: type || null,
    ...extra,
  });
  // console.log('Bevestiging:', bevestigd)
  return bevestigd;
}

function setPeriode() {
  // Zet de periode van de ranking op basis van de selected semester
  const [year, semester] = currentSemester.value.split("-");
  const startMonth = semester === "1" ? "01" : "07";
  vanaf.value = `${year}-${startMonth}-01`;
  tot.value = `${year}-${semester === "1" ? "06" : "12"}-31`;
  filterToernooien();
  filterRankingByPeriod();
}

async function maakPdf(showPdf = true) {
  // console.log("PDF maken voor toernooi:", thisToernooiID.value, "Datum:", thisToernooiDatum.value)
  if (!allMatchesPlayed()) {
    toast.warning(
      "De PDF kan pas gemaakt worden als alle wedstrijden minimaal een score hebben.",
      {
        position: "top-center",
        timeout: 5000,
      },
    );
    return false;
  }

  const pdfFileName = getPdfFileName(thisToernooiDatum.value);
  if (await dbService.pdfExists(pdfFileName)) {
    pdfUrl.value = getPdfUrl(thisToernooiDatum.value);
    const ok = await bevestig(
      "Afdruk",
      "De PDF bestaat al. Wil je deze opnieuw aanmaken?",
      "question",
    );
    if (ok) {
      pdfUrl.value = null; // reset de PDF URL
    } else {
      dbService.openPDF(pdfFileName);
      return; // PDF bestaat al, dus niets meer doen
    }
  }
  await refreshRankingDataForPdf();

  const { jsPDF, uitslagPDF, rankingPDF } = await loadPdfDependencies();

  const datum = thisToernooiDatum.value || new Date();
  const doc = new jsPDF();
  await uitslagPDF(doc, datum, groepsToernooi.value);
  doc.addPage();
  rankingPDF(
    doc,
    filteredRanking.value,
    filteredToernooien.value,
    thisToernooiDatum.value,
  );
  let tnNaam = "Kraken " + niceDate(thisToernooiDatum.value, true) + ".pdf";
  tnNaam = tnNaam.replace(/\s+/g, "_").toLowerCase(); // vervang spaties door streepjes en zet om naar kleine letters
  const opgeslagen = await savePDF(doc, tnNaam);
  if (!opgeslagen) return;

  // Korte wachttijd zodat de browser de nieuw opgeslagen PDF direct kan vinden.
  await new Promise((resolve) => setTimeout(resolve, 600));

  pdfUrl.value = getPdfUrl(thisToernooiDatum.value);
  if (showPdf) {
    const openPdfNow = await bevestig(
      "PDF opgeslagen",
      "De PDF is opgeslagen. Wil je deze nu openen?",
      "question",
    );
    if (openPdfNow) {
      dbService.openPDF(tnNaam);
    }
  }

  return true;
}

async function refreshRankingDataForPdf(maxAttempts = 4, delayMs = 300) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await getSavedToernooien();
    await getRanking();
    await filterToernooien();
    await filterRankingByPeriod();

    const hasCurrentTournament = toernooien.value.some((tn) => {
      if (thisToernooiID.value && tn.id === thisToernooiID.value) return true;
      return stripTime(tn.datum) === stripTime(thisToernooiDatum.value);
    });

    if (hasCurrentTournament || attempt === maxAttempts) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

async function cleanDatabase() {
  try {
    const ok = await bevestig(
      "Opschonen database",
      "Weet je zeker dat je teams zonder toernooi en spelers zonder team wilt verwijderen?",
      "warning",
    );
    if (ok) {
      const response = await dbService.cleanTeamsAndPlayers();
      const data = response.data;
      let msg = "";
      //      // console.log("Data", data)
      if (data.success) {
        //
        if (data.aantal > 0) {
          if (data.items.teams && data.items.teams.length > 0) {
            const teamList = data.items.teams
              .map((item) => `<li>${item}</li>`)
              .join("");
            msg += DOMPurify.sanitize(`
            <h2><strong>Verwijderde teams:</strong></h2>
            <ol>
              ${teamList}
            </ol>
          `);
          }
          if (data.items.spelers && data.items.spelers.length > 0) {
            const spelersList = data.items.spelers
              .map((item) => `<li>${item}</li>`)
              .join("");
            msg += DOMPurify.sanitize(`
            <h2><strong>Verwijderde spelers:</strong></h2>
            <ol>
              ${spelersList}
            </ol>
          `);
          }
        } else {
          msg = "Geen items verwijderd";
        }
        //        // console.log("Opschoningsresultaat:", msg);
        toastHTML("info", msg, {
          position: "top-center",
          timeout: 8000,
        });

        await getSavedTeamsFromApi();
      }
    }
  } catch (error) {
    console.error("Fout bij het opschonen van de database:", error);
    toast.error("Fout bij het opschonen van de database: " + error.message, {
      position: "top-center",
      timeout: 5000,
    });
  }
}

async function savePDF(doc, tnNaam) {
  // Sla de PDF op op de server
  const formData = new FormData();
  formData.append("file", doc.output("blob"), tnNaam);
  try {
    const response = await dbService.uploadPDF(formData);
    if (response.success) {
      toast.success("PDF opgeslagen", {
        position: "top-center",
        timeout: 2000,
      });
      return true;
    } else {
      toast.error("Fout bij het opslaan van de PDF: " + response.message, {
        position: "top-center",
        timeout: 5000,
      });
      return false;
    }
  } catch (error) {
    console.error("Fout bij het uploaden van de PDF:", error);
    toast.error("Fout bij het uploaden van de PDF: " + error.message, {
      position: "top-center",
      timeout: 5000,
    });
    return false;
  }
}

// async function openOrUploadPDF(file) {
//   const filename = file.name.replace(/\s+/g, "-").toLowerCase();

//   const exists = await dbService.pdfExists(filename);

//   if (exists) {
//     dbService.openPDF(filename);
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", file);

//   const { url } = await dbService.uploadPDF(formData);
//   window.open(url, "_blank");
// }

function getPdfFileName(datum) {
  return `Kraken_${niceDate(datum, true)}.pdf`
    .replace(/\s+/g, "_")
    .toLowerCase();
}

// async function pdfBestaat(datum) {
//   const result = await dbService.pdfExists(pdfNaam);
//   // console.log(result.exists);
//   if (result.exists) {
//     const pdf = await dbService.fetchPDF(pdfNaam);
//     return pdf;
//   } else {
//     return null;
//   }
// }

async function filterToernooien() {
  // Filter de toernooien op basis van de geselecteerde periode
  // console.log("toernooien:", toernooien.value);
  filteredToernooien.value = toernooien.value
    .filter((tn) => {
      const date = new Date(stripTime(tn.datum));
      return (
        date >= new Date(stripTime(vanaf.value)) &&
        date <= new Date(stripTime(tot.value))
      );
    })
    .sort((a, b) => new Date(a.datum) - new Date(b.datum));
  // console.log("Gefilterde toernooien:", filteredToernooien.value);
}

function getSemesters() {
  const uniqueDates = new Set();
  toernooien.value.forEach((tn) => {
    const date = new Date(tn.datum);
    const semester = `${date.getFullYear()}-${Math.ceil(
      (date.getMonth() + 1) / 6,
    )}`;
    uniqueDates.add(semester);
  });
  return Array.from(uniqueDates).sort();
}
function getCurrentSemester() {
  //  console.log("Huidige semester:", currentSemester.value);
  setPeriode();
}

function setActiveSemester() {
  // Zet de huidige semester op basis van het huidige toernooi
  if (thisToernooiDatum.value) {
    const date = new Date(thisToernooiDatum.value);
    currentSemester.value = `${date.getFullYear()}-${Math.ceil(
      (date.getMonth() + 1) / 6,
    )}`;
    //    //    // console.log("Huidige semester ingesteld:", currentSemester.value);
  } else {
    currentSemester.value = `${new Date().getFullYear()}-${Math.ceil(
      (new Date().getMonth() + 1) / 6,
    )}`;
  }
  setPeriode();
}

function teamSelected(tm) {
  const idx = toernooiTeams.value.indexOf(tm);
  return idx > -1;
}
const availableTeams = computed(() => {
  if (toernooiTeams.value.length === 0) return savedTeams.value;
  const selectedSpelers = new Set();
  toernooiTeams.value.forEach((team) => {
    const spelers = team.split("/");
    spelers.forEach((speler) => selectedSpelers.add(speler.trim()));
  });
  //  console.log("selectedSpelers:", selectedSpelers);
  // Filter teams: niet geselecteerd en geen overlap in spelers
  const availTeams = savedTeams.value.filter((team) => {
    const teamleden = team.split("/").map((t) => t.trim());
    //    console.log("teamleden:", teamleden);
    return !teamleden.some((player) => selectedSpelers.has(player));
  });
  //  console.log("availableTeams:", availTeams);
  return availTeams;
});

const filteredSavedTeams = computed(() => {
  const query = savedTeamsSearch.value.trim().toLowerCase();
  if (!query) return savedTeams.value;
  return savedTeams.value.filter((team) => team.toLowerCase().includes(query));
});

// const isTeamDisabled = (team) => {
//   // check if teamplayers are in one of the selected teams
//   if (team.id === selectedTeam.value.id) return false;

//   const selectedPlayers = selectedTeam.value.players;
//   return team.players.some((p) => selectedPlayers.includes(p));
// };

function toggleEditMode() {
  editMode.value = !editMode.value;
  //  console.log("Edit mode toggled:", editMode.value);
}

async function getSavedToernooien() {
  const response = await dbService.fetchToernooien();
  //  console.log("Toernooien opgehaald:", response.data);
  toernooien.value = response.data;
  // console.log("Toernooien:", toernooien.value);
  selectToernooi.value = "Toernooien";
}

async function getAllSpelers() {
  const response = await dbService.fetchAllPlayers();
  spelers.value = response.data.map((speler) => speler.naam);
  // console.log("Alle spelers opgehaald:", spelers.value);
}

function editTeam(i) {
  // plaats de team naam in het input veld
  //  console.log(i, "toernooiTeams:", toernooiTeams.value[i], "tournamentStarted:", tournamentStarted);
  if (!tournamentStarted.value) {
    newTeam.value = toernooiTeams.value[i];
    // tijdelijk weghalen uit array
    toernooiTeams.value.splice(i, 1);
  }
}
function removeTeam(i) {
  // haal het team uit de lijst met gekozen toernooiTeams
  if (!tournamentStarted.value) {
    toernooiTeams.value.splice(i, 1);
  }
}

function toggleShowRanking() {
  if (!showRanking.value) {
    showSavedTeamsList.value = false; // verberg de teams lijst als we de ranking tonen
    // console.log("Huidige ranking verbergen");
  }
  showRanking.value = !showRanking.value;
}

function allMatchesPlayed() {
  // check of alle matches een uislag hebben in de localeStorage
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");

  if (!m && !gm) return false; // geen matches = niets gespeeld

  if (gm) {
    const groupMatches = JSON.parse(gm);
    return groupMatches.every((group) =>
      group.every((match) => {
        return match.every((tafel) => hasAnyScore(tafel));
      }),
    );
  }

  const matches = JSON.parse(m);
  return matches.every((round) => round.every((match) => hasAnyScore(match)));
}

function removeTeamsFromToernooi() {
  // Haal alle toernooiTeams uit de deelnemers lijst
  toernooiTeams.value = [];
}

function hasAnyEnteredScore() {
  const parseMatches = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };

  const singleMatches = parseMatches("tournamentMatches") || [];
  if (
    Array.isArray(singleMatches) &&
    singleMatches.some(
      (round) =>
        Array.isArray(round) && round.some((match) => hasAnyScore(match)),
    )
  ) {
    return true;
  }

  const groupMatches = parseMatches("tournamentGroupMatches") || [];
  if (
    Array.isArray(groupMatches) &&
    groupMatches.some(
      (group) =>
        Array.isArray(group) &&
        group.some(
          (round) =>
            Array.isArray(round) && round.some((match) => hasAnyScore(match)),
        ),
    )
  ) {
    return true;
  }

  const finalMatches = parseMatches("tournamentFinalMatches") || [];
  if (
    Array.isArray(finalMatches) &&
    finalMatches.some((match) => hasAnyScore(match))
  ) {
    return true;
  }

  return false;
}

async function undoTournamentStart() {
  if (!startUndoSnapshot.value) return;

  if (hasAnyEnteredScore()) {
    const ok = await bevestig(
      "Toernooistart ongedaan maken",
      "Er zijn al scores ingevuld. Bij ongedaan maken raak je dit schema en de scores kwijt. Doorgaan?",
      "warning",
    );
    if (!ok) return;
  }

  const snapshot = startUndoSnapshot.value;

  // Bij automatische save direct na start bestaat er al een nieuw toernooi-ID.
  // Dat tijdelijke toernooi verwijderen we weer als de start wordt teruggedraaid.
  if (thisToernooiID.value && serverAvailable.value) {
    try {
      await dbService.deleteToernooi(thisToernooiID.value);
    } catch (error) {
      toast.error(
        "Undo start mislukt: kon gestart toernooi niet verwijderen.",
        {
          position: "top-center",
          timeout: 2000,
        },
      );
      return;
    }
  }

  thisToernooiID.value = null;
  selectToernooi.value = "Toernooien";
  tournamentStarted.value = false;
  editMode.value = false;
  groepsToernooi.value = false;
  toernooiTeams.value = [...snapshot.teams];
  repeatRounds.value = snapshot.repeatRounds;
  thisToernooiDatum.value = snapshot.toernooiDatum;

  resetLocalStorage(false);
  localStorage.setItem("tournamentTeams", JSON.stringify(snapshot.teams));
  window.dispatchEvent(new Event("storage"));
  scoresEntered.value = false;
  startUndoSnapshot.value = null;

  toast.info("Toernooistart is ongedaan gemaakt. Je kunt teams nu aanpassen.", {
    position: "top-center",
    timeout: 3000,
  });
}

async function resetApp() {
  // reset de app naar de begin staat
  selectToernooi.value = "Toernooien";
  thisToernooiID.value = null;
  thisToernooiDatum.value = new Date();
  repeatRounds.value = 1;
  tournamentStarted.value = false;
  toernooiTeams.value = [];
  newTeam.value = "";
  editMode.value = false;
  startUndoSnapshot.value = null;
  resetLocalStorage(true);
  await getSavedToernooien();
  await getSavedTeamsFromApi();
  filterToernooien();
  setActiveSemester();
  await getRanking();
  filterRankingByPeriod();
}

function scoresAreEntered() {
  const hasScores =
    JSON.parse(localStorage.getItem("tournamentMatches")) ||
    JSON.parse(localStorage.getItem("tournamentGroupMatches"));
  scoresEntered.value = hasScores !== null;
  // console.log("scoresEntered:", scoresEntered.value);
}

async function sluitToernooi() {
  // console.log("Sluit toernooi af, started, scoresEntered, ID:", tournamentStarted.value, scoresEntered.value, thisToernooiID.value);
  if (tournamentStarted.value && scoresEntered.value && editMode.value) {
    if (!thisToernooiID.value) {
      // toernooi nog niet opgeslagen, dus nu opslaan
      //      // console.log("Toernooi nog niet opgeslagen, nu opslaan.");
      if (scoresEntered.value && !allMatchesPlayed()) {
        const ok = await bevestig(
          "Niet alle wedstrijden gespeeld",
          "Niet alle wedstrijden zijn gespeeld. Weet je zeker dat je het toernooi wilt opslaan? De PDF wordt pas gemaakt als alle wedstrijden minimaal een score hebben.",
          "warning",
        );
        if (!ok) {
          return; // afbreken
        }
      }
      await saveTournament();
      if (allMatchesPlayed()) {
        await maakPdf();
      }
      resetApp();
      //      //      //      console.log("Toernooi opgeslagen, nu Ranking ophalen.");
      // await filterToernooien();
      // await getRanking("Ranking bijgewerkt na opslaan.");
      // await filterRankingByPeriod();
      //      // //      //      console.log("Ranking opgehaald, nu PDF maken.");
      // await maakPdf();
    } else {
      if (editMode.value) {
        // als we in edit mode zijn, dan eerst opslaan
        await saveTournamentChanges("Toernooi opgeslagen.");
        await getRanking();
        if (allMatchesPlayed()) {
          await maakPdf(editMode);
        }
      }
      resetApp();
    }
    editMode.value = false;
    thisToernooiID.value = null;
    resetApp();
  } else {
    // tournamentStarted == false  of er zijn nog geen scores ingevoerd
    // console.log("Toernooi nog niet gestart, reset de app.");
    resetApp();
  }
}

function resetLocalStorage(inclTeams = true) {
  // reset de local storage
  if (inclTeams) {
    localStorage.removeItem("tournamentTeams");
    toernooiTeams.value = [];
  }
  localStorage.removeItem("matches");
  localStorage.removeItem("tournamentGroups");
  localStorage.removeItem("tournamentGroupMatches");
  localStorage.removeItem("tournamentMatches");
  localStorage.removeItem("tournamentFinalMatches");
  localStorage.removeItem("repeatRounds");
  localStorage.removeItem("toernooiTeams");
}

async function handleSelectTournament() {
  if (selectToernooi.value && selectToernooi.value.id) {
    await selectTournament(selectToernooi.value.id);
    setActiveSemester();
    setPeriode();
  }
}

async function openTournamentFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tidRaw = params.get("tid");
  const tid = Number(tidRaw);
  if (!Number.isInteger(tid) || tid <= 0) return;

  try {
    await selectTournament(tid);
  } catch (error) {
    console.error("Kon toernooi uit URL niet openen:", error);
  }
}

async function selectTournament(tn) {
  thisToernooiID.value = tn;
  // console.log("Selecteer toernooi met ID:", tn)
  // laad de toernooiTeams van het geselecteerde toernooi
  await loadTournament(tn);

  pdfUrl.value = getPdfUrl(thisToernooiDatum.value);
  toernooiSaved.value = true;
  startUndoSnapshot.value = null;
  // toernooi is geladen, dus opgeslagen
  //  console.log("Datum van het toernooi:", thisToernooiDatum.value);
}

async function loadTournament(tn) {
  //  console.log("loadTournament", tn)
  //  console.log("Loading tournament data from:", api);
  const response = await dbService.fetchToernooi(tn);
  const data = response.data;
  // console.log("Toernooi data:", data)
  // sla de toernooi data op in localStorage
  thisToernooiID.value = data.id;
  repeatRounds.value = data.repeatRounds || 1;
  // toernooiTeams
  thisToernooiDatum.value = data.datum ? new Date(data.datum) : new Date();
  groepsToernooi.value = data.groepsToernooi !== 0;
  //      // console.log("tournamentTeams", data.teams);
  localStorage.setItem("tournamentTeams", data.teams);
  if (!groepsToernooi.value || groepsToernooi.value === 0) {
    localStorage.setItem("tournamentMatches", data.matches);
  } else {
    localStorage.setItem("tournamentGroups", data.groups);
    localStorage.setItem("tournamentGroupMatches", data.groupMatches);
    localStorage.setItem("tournamentFinalMatches", data.finalMatches);
  }
  tournamentStarted.value = true;
}

async function saveToApi() {
  await standardTeamsToApi();
  await saveTournament("Alles is opgeslagen!");
  await getRanking();
}

async function standardTeamsToApi(msg) {
  // standaard teams

  // if (!serverAvailable.value) return

  const bewaardeTeams = savedTeams.value.map((team) => {
    // verdeel in twee namen van de spelers
    const sp = team.split("/");
    return {
      players: sp,
    };
  });
  // console.log("saveToApi teams:", bewaardeTeams)
  const sendTeams = {
    teams: bewaardeTeams,
  };
  try {
    await dbService.saveStandardTeams(sendTeams);
    if (msg) {
      toast.success(msg, {
        position: "top-center",
        timeout: 2000,
      });
    }
  } catch (error) {
    toast.error("Fout bij het opslaan van standaard teams: " + error.message, {
      position: "top-center",
      timeout: 2000,
    });
    console.error("Fout bij het opslaan van standaard teams:", error);
  }
}

async function saveTournamentChanges(msg = "Toernooi opgeslagen") {
  if (!selectToernooi.value || !serverAvailable.value) return;
  const pdfNaam = ("Kraken " + niceDate(thisToernooiDatum.value, true) + ".pdf")
    .replace(/\s+/g, "_")
    .toLowerCase();
  if (thisToernooiID.value) {
    await dbService.updateToernooi(thisToernooiID.value, {
      teams: localStorage.getItem("tournamentTeams"),
      matches: localStorage.getItem("tournamentMatches"),
      groups: localStorage.getItem("tournamentGroups"),
      groupMatches: localStorage.getItem("tournamentGroupMatches"),
      finalMatches: localStorage.getItem("tournamentFinalMatches"),
      groepsToernooi: groepsToernooi.value || false,
      repeatRounds: repeatRounds.value || 1,
      pdfUrl: pdfNaam || null,
    });
    if (msg) {
      toast.success(msg, {
        position: "top-center",
        timeout: 2000,
      });
    }
    logTournamentEvent("tournament_saved", {
      mode: "update",
      teamCount: JSON.parse(localStorage.getItem("tournamentTeams") || "[]")
        .length,
      groepsToernooi: groepsToernooi.value || false,
      repeatRounds: repeatRounds.value || 1,
    });
    await getRanking();
    filterRankingByPeriod();
  }
}

async function saveTournament(msg = "") {
  if (!serverAvailable.value) {
    //    //    console.log("Server niet beschikbaar, kan toernooi niet opslaan.");
    toast.warning("Server niet beschikbaar, kan toernooi niet opslaan.", {
      position: "top-center",
      timeout: 5000,
    });
    return;
  }
  // tournament
  const tnId = thisToernooiID.value || null;
  if (tnId) {
    // toernooi bestaat al, dus update
    await saveTournamentChanges(msg);
    return;
  }
  thisToernooiDatum.value = thisToernooiDatum.value || new Date();
  const savedDate = stripTime(thisToernooiDatum.value);
  const tnTeams = localStorage.getItem("tournamentTeams");
  const matches = localStorage.getItem("tournamentMatches");
  const groups = localStorage.getItem("tournamentGroups");
  const groupMatches = localStorage.getItem("tournamentGroupMatches");
  const finalMatches = localStorage.getItem("tournamentFinalMatches");
  // stel pdf naam samen (zonder path)
  const pdfNaam = ("Kraken " + niceDate(savedDate, true) + ".pdf")
    .replace(/\s+/g, "_")
    .toLowerCase();

  //  console.log("saveToApi tournamentTeams:", tnTeams, "groups:", groups, "groupMatches:", groupMatches, "finalMatches:", finalMatches)

  const toernooi = {
    datum: savedDate,
    teams: tnTeams ? JSON.parse(tnTeams) : [],
    matches: matches ? JSON.parse(matches) : [],
    groups: groups ? JSON.parse(groups) : [],
    groupMatches: groupMatches ? JSON.parse(groupMatches) : [],
    finalMatches: finalMatches ? JSON.parse(finalMatches) : [],
    groepsToernooi: groepsToernooi.value || false,
    repeatRounds: repeatRounds.value || 1,
    pdfUrl: pdfNaam || null,
  };
  //   console.log("Toernooi data om op te slaan:", toernooi);
  try {
    // sla het toernooi op in de database
    const response = await dbService.saveToernooi(toernooi);
    // console.log("response bij save:", response.data.message);
    thisToernooiID.value = response.data.id; // sla het ID van het toernooi op
    // console.log("Toernooi opgeslagen met ID:", thisToernooiID.value)
    toernooiSaved.value = true; // toernooi is opgeslagen
    logTournamentEvent("tournament_saved", {
      mode: "create",
      teamCount: toernooi.teams.length,
      groepsToernooi: toernooi.groepsToernooi,
      repeatRounds: toernooi.repeatRounds,
    });
    if (msg) {
      toast.success(msg, {
        position: "top-center",
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error("Fout bij het opslaan van toernooi:", error);
    toast.error("Fout bij het opslaan van toernooi: " + error.message, {
      position: "top-center",
      timeout: 2000,
    });
    return;
  }
}

async function removeTournament(tn) {
  if (!serverAvailable.value) return;
  // vraag 1 keer bevestiging
  let ok = await bevestig(
    "Toernooi verwijderen",
    `Weet je zeker dat je het toernooi op ${niceDate(
      tn.datum,
    )} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
    "warning",
  );
  if (!ok) return;
  // vraag nogmaals
  ok = await bevestig(
    "Let op",
    "Doe dit alleen met test toernooien!",
    "warning",
  );
  if (!ok) return;
  // vraag nogmaals
  ok = await bevestig(
    "Echt verwijderen?",
    `WEET JE HET ECHT HEEL ZEKER? Dit kan niet ongedaan worden gemaakt!`,
    "error",
  );
  if (!ok) return;
  // verwijder het toernooi uit de database
  await dbService.deleteToernooi(tn.id);
  resetApp();
  toast.success(`Toernooi op ${niceDate(tn.datum)} is verwijderd.`, {
    position: "top-center",
    timeout: 2000,
  });
}

async function addTeam(team) {
  newTeam.value = team;
  if (newTeam.value.trim()) {
    // console.log("Add team:", newTeam.value);
    newTeam.value = cleanTeamName(newTeam.value);
    const idx = savedTeams.value.indexOf(newTeam.value);
    // console.log(savedTeams.value);
    // console.log("New team:", newTeam.value, "Index in lijst:", idx);
    // check if element exists
    if (idx < 0) {
      // dit team bestaat nog niet in de lijst op de server
      // check of een van de teamleden al bestaat in een ander team
      const leden = newTeam.value.split("/");
      //      // console.log("Alle spelers:", spelers.value);
      //      // console.log("Nieuwe teamleden:", leden);
      // check of een van de leden al in de spelers lijst zit
      // for (let i = 0; i < leden.length; i++) {
      //   const speler = leden[i].trim();
      //   if (spelers.value.includes(speler)) {
      //     const ok = await bevestig(
      //       "Speler bestaat al",
      //       `De naam ${speler} komt al voor in een ander team. Is dit dezelfde ${speler}?`,
      //       "question",
      //     );
      //     if (!ok) {
      //       alert(
      //         `Kies een andere naam voor ${speler} (bijvoorbeeld een letter extra) en probeer het opnieuw.`,
      //       );
      //       return; // conflict
      //     }
      //   }
      // }
    }
    if (toernooiTeams.value.length >= 8) {
      alert("Maximaal 8 teams toegestaan!");
      newTeam.value = "";
      return;
    }
    if (toernooiTeams.value.length >= 6) {
      repeatRounds.value = 1; // bij meer dan 6 teams altijd 1 ronde, anders wordt het te veel
    }
    // nee, dus toevoegen
    // addPlayers(newTeam.value)   // spelers toevoegen eventueel
    toernooiTeams.value.push(newTeam.value.trim());
    newTeam.value = "";
  }
}

function addAll() {
  // voeg alle teams uit de savedTeams toe aan de toernooiTeams
  savedTeams.value.forEach((tm) => {
    getTeam(tm);
  });
}

function getTeam(tm) {
  // is het team al in het toernooi?
  tm = cleanTeamName(tm);
  const idx = toernooiTeams.value.indexOf(tm);
  if (idx < 0) {
    // nee, dus toevoegen
    // addPlayers(tm)   // spelers toevoegen eventueel
    if (toernooiTeams.value.length < 8) {
      toernooiTeams.value.push(tm);
    }
  } else {
    // ja, dus weghalen
    toernooiTeams.value.splice(idx, 1);
  }
}

async function removeStandardTeam(tm) {
  // zit dit team wel in het savedTeams array?
  const idx = savedTeams.value.indexOf(tm);
  // maar niet in het teams array
  const idx2 = toernooiTeams.value.indexOf(tm);
  //. zo ja, weghalen
  if (idx > -1 && idx2 < 0) {
    const ok = await bevestig(
      "Team verwijderen",
      `${tm} definitief verwijderen uit standaardlijst?`,
      "warning",
    );
    if (ok) {
      savedTeams.value.splice(idx, 1);
      // en maar gelijk opslaan, anders blijft ie hangen
      localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
      // en ook in de API bijwerken
      standardTeamsToApi("Team verwijderd uit standaardlijst: " + tm);
    }
  }
}

async function removeAllStandardTeams() {
  const ok = await bevestig(
    "Alle teams verwijderen",
    `Alle toernooiTeams verwijderen uit de standaardlijst?`,
    "warning",
  );
  if (ok) {
    savedTeams.value = [];
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
  }
}

const filteredTeams = computed(() =>
  toernooiTeams.value.map((t) => t.trim()).filter((t) => t),
);

watch(filteredTeams, (newTeams) => {
  // console.log("toernooiTeams gewijzigd:", newTeams);
  localStorage.setItem("tournamentTeams", JSON.stringify(newTeams));
});

async function startTournament() {
  if (filteredTeams.value.length >= 4) {
    const selectedDate = stripTime(thisToernooiDatum.value || new Date());
    const response = await dbService.getToernooiIdByDate(selectedDate);
    const existingTournamentId = response?.data?.id ?? null;
    if (existingTournamentId) {
      const action = await bevestig(
        "Toernooi bestaat al",
        "Er bestaat al een toernooi op deze datum. Wat wil je doen?",
        "warning",
        {
          actions: [
            {
              label: "Overschrijven en verwijderen",
              value: "overwrite",
              className: "bg-red-600 text-white hover:bg-red-700",
            },
            {
              label: "Openen voor aanpassingen",
              value: "open",
              className: "bg-blue-600 text-white hover:bg-blue-700",
            },
            {
              label: "Annuleren",
              value: "cancel",
              className: "bg-gray-200 text-gray-700 hover:bg-gray-300",
            },
          ],
        },
      );
      if (action === "overwrite") {
        // oude gegevens verwijderen
        resetLocalStorage(false); // reset de data in localStorage (just to be sure), maar niet de geselecteerde teams
        // verwijder het oude toernooi
        await dbService.deleteToernooi(existingTournamentId);
        thisToernooiID.value = null; // reset toernooi ID
        selectToernooi.value = "Toernooien";
      } else if (action === "open") {
        await selectTournament(existingTournamentId);
        editMode.value = true;
        toast.info("Bestaand toernooi geopend voor aanpassingen.", {
          position: "top-center",
          timeout: 3000,
        });
        return;
      } else {
        return;
      }
    }

    // begin nieuw toernooi
    addTeamsToList(); // voeg eventueel nieuwe teams aan de standaardlijst toe
    groepsToernooi.value = false;
    if (filteredTeams.value.length >= 7) {
      // Bepaal of het een groepstoernooi wordt
      groepsToernooi.value = await bevestig(
        "Groepstoernooi",
        "Er zijn meer dan 6 teams, wil je twee groepen aanmaken?",
        "question",
      );
    }
    if (groepsToernooi.value) repeatRounds.value = 1; // bij groepsfase altijd 1 ronde, anders wordt het te veel

    if (
      !groepsToernooi.value &&
      filteredTeams.value.length === 4 &&
      repeatRounds.value === 1
    ) {
      const lieverTweeRondes = await bevestig(
        "Vier teams",
        "Er zijn precies 4 teams. Wil je liever 2 rondes spelen?",
        "question",
      );
      if (lieverTweeRondes) {
        repeatRounds.value = 2;
      }
    }

    let rndTxt = "ronde";
    if (repeatRounds.value > 1) rndTxt = "rondes";
    let msg = `Het schema wordt gemaakt voor ${repeatRounds.value} ${rndTxt} \nmet ${filteredTeams.value.length} teams`;
    if (groepsToernooi.value) {
      msg += ", verdeeld over twee groepen";
    }
    msg += `\n\nIs dit de bedoeling?`;
    const ok = await bevestig("Toernooi starten", msg, "question");
    if (!ok) {
      return; // afbreken
    }
    startUndoSnapshot.value = {
      teams: [...toernooiTeams.value],
      repeatRounds: repeatRounds.value,
      toernooiDatum: selectedDate,
    };
    tournamentStarted.value = true;
    editMode.value = true;
    // sla de toernooiTeams op in localStorage
    // console.log("toernooiTeams:", toernooiTeams.value);
    localStorage.setItem(
      "tournamentTeams",
      JSON.stringify(toernooiTeams.value),
    );
    logTournamentEvent("tournament_started", {
      teamCount: filteredTeams.value.length,
      teams: [...filteredTeams.value],
      groepsToernooi: groepsToernooi.value,
      repeatRounds: repeatRounds.value,
    });
    toast.info("Toernooi is begonnen.", {
      position: "top-center",
      timeout: 2000,
    });
  } else {
    alert("Voer minimaal 4 teams in voor een toernooi.");
  }
}

function addTeamsToList() {
  let teamsSaved = false;
  if (!toernooiTeams.value.every((tm) => savedTeams.value.includes(tm))) {
    // check for new items
    // voeg toernooiTeams toe aan savedTeams als ze (nog) niet bestaan
    toernooiTeams.value.forEach((tm, index) => {
      if (!savedTeams.value.includes(tm)) {
        // gaan we niet meer om vragen, nieuwe teams worden automatisch toegevoegd. kunnen altijd weer worden verwijderd.
        savedTeams.value.push(tm);
        teamsSaved = true;
      }
    });
    savedTeams.value.sort();
    // en savedTeams array opslaan
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    // en ook naar de API sturen
    if (teamsSaved) {
      standardTeamsToApi("Nieuwe teams zijn opgeslagen");
    }
  }
}

async function getSavedTeamsFromApi() {
  if (!serverAvailable.value) return;
  try {
    const response = await dbService.fetchSavedTeams();
    const teamLijst = response.data.sort();
    savedTeams.value = [];
    teamLijst.forEach((tm) => {
      const thisTeam = cleanTeamName(tm.team);
      if (!savedTeams.value.includes(thisTeam)) {
        savedTeams.value.push(thisTeam);
      }
    });
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value.sort()));
  } catch (error) {
    console.error("Fout bij het ophalen van teams:", error);
    toast.error("Fout bij het ophalen van teams: " + error.message, {
      position: "bottom-center",
      timeout: 2000,
    });
  }
}

async function isServerActive() {
  // controleer of de server beschikbaar is
  const response = await dbService.checkServer();
  if (response.success) {
    serverAvailable.value = true;
    // console.log("Server is actief:", response.data);
  } else {
    serverAvailable.value = false;
    console.warn("Server niet beschikbaar:", response.status);
  }
}

const getRanking = async (msg) => {
  // haal de ranking op van de API
  if (!serverAvailable.value) return; // als de server niet beschikbaar is, doe niets
  try {
    const response = await dbService.fetchRanking();

    // console.log(response)
    //    //    console.log("Ranking opgehaald:", response.data);
    rankingData.value = response.data;
    if (msg) {
      toast.success(msg, {
        position: "top-center",
        timeout: 2000,
      });
    }
  } catch (error) {
    console.error("Fout bij het ophalen van ranking:", error);
    toast.error("Fout bij het ophalen van ranking: " + error.message, {
      position: "bottom-center",
      timeout: 4000,
    });
    return;
  }
};

async function filterRankingByPeriod() {
  const start = new Date(vanaf.value);
  const end = new Date(tot.value);
  //  console.log("Filtering ranking from", start, "to", end);
  //  console.log("Ranking data:", rankingData.value);
  const resultAll = rankingData.value.map((speler) => {
    const filteredScores = speler.scores.filter((s) => {
      const d = new Date(s.datum);
      return d >= start && d <= end;
    });
    const beste6 = [...filteredScores]
      .sort((a, b) => b.punten - a.punten)
      .slice(0, 6);
    const totaal = beste6.reduce((sum, s) => sum + s.punten, 0);
    //    //    //    console.log("Totaal punten voor", speler.speler, ":", totaal)
    return {
      speler: speler.speler,
      scores: filteredScores,
      totaal,
    };
  });
  const result = resultAll.filter((s) => s.totaal > 0);
  result.sort((a, b) => b.totaal - a.totaal);
  //  console.log("Result:", result)
  let lastTotaal = null;
  let plaats = 0;
  let echtePlaats = 0;

  const metPlaats = result.map((s) => {
    echtePlaats++;
    if (s.totaal !== lastTotaal) {
      plaats = echtePlaats;
      lastTotaal = s.totaal;
    }
    return { ...s, plaats };
  });
  //  console.log("Filtered ranking:", metPlaats)
  filteredRanking.value = metPlaats;
}

onMounted(async () => {
  updateScale();
  // console.log("Test db-server", await dbService.checkServer());
  window.addEventListener("resize", updateScale);
  registerConfirmDialog(dialog.value);
  await isServerActive(); // kijk o de server beschikbaar is
  setActiveSemester(); // zet de huidige semester
  window.addEventListener("storage", scoresAreEntered);
  if (serverAvailable.value) {
    if (!standOnlyView.value) {
      toastHTML(
        "info",
        "<strong>KRAKEN</strong><p><strong>Welkom bij Jota's Kraak Score</strong></p><p>Gegevens zijn opgehaald van de server</p>",
        {
          position: "top-center",
          timeout: 3000,
        },
      );
    }
    toernooiSaved.value = false;
    resetLocalStorage(); // reset de localStorage,
    await getSavedTeamsFromApi();
    await getSavedToernooien();
    await getAllSpelers();
    await getRanking();
    filterToernooien();
    filterRankingByPeriod();
    await openTournamentFromUrl();
  } else {
    // haal de opgeslagen teams uit localStorage
    const saved = localStorage.getItem("savedTeams");
    if (saved) {
      savedTeams.value = JSON.parse(saved);
    }
  }
});
</script>

<!-- registreer de directive -->
<script>
export default {
  directives: {
    longpress,
  },
};
</script>

<style scoped></style>

<template>
  <div class="max-w-4xl mx-auto space-y-4 maindiv rounded">
    <div class="kop">
      <div class="titelregel flex justify-between items-center  ">
        <h1 class="text-2xl font-bold">
          <span v-if="thisToernooiID">Kraaktoernooi</span>
          <span v-else>
            <span class="boom">LaurierBoom Kraak</span>
          </span>
        </h1>
        <div v-if="!thisToernooiID && !tournamentStarted && serverAvailable" class="items-center ">
          <select id="toernooien" v-model="selectToernooi" class="p-1 border bg-white rounded m-1 "
            @change="handleSelectTournament">
            <option value="Toernooien" disabled>Toernooien</option>
            <option v-for="tn, tnindex in toernooien" :key="tnindex" :value="tn">
              {{ niceDate(tn.datum, true) }}</option>
          </select>
          <button @click="toggleShowRanking" v-tooltip="'Ranking'"
            class="text-white bg-blue-800 px-2 rounded mt-2 mr-0 p-2">
            <span v-if="showRanking">Terug</span>
            <span v-else>Ranking</span>
          </button>
          <select @change="setPeriode()" class="p-1 bg-white border rounded m-1" name="semester" id="semester"
            v-model="currentSemester">
            <option v-for="semester in getSemesters()" :key="semester" :value="semester">
              {{ semester }}
            </option>
          </select>
          <!-- <p @click="toggleShowRanking" v-if="!thisToernooiID" class="copyright" v-tooltip="'Toon ranking'">©2025 Jota
            Services</p> -->

        </div>
        <div v-if="selectToernooi !== 'Toernooien'" class="titel regel flex justify-left ">
          <h2 class="text-sm text-white m-1">Datum: {{ niceDate(thisToernooiDatum) }} </h2>

          <button v-if="!editMode" v-tooltip="'Bewerk dit toernooi'" class="bg-transparent border-0 p-1"
            @click="toggleEditMode">
            <PencilSquareIcon class="h-6 w-6 text-blue-100" />
          </button>
          <button v-if="editMode" v-tooltip="'Sla dit toernooi op'" class="bg-transparent border-0 p-1"
            @click="saveTournamentChanges">
            <InboxIcon class="h-6 w-6 text-green-300" />
          </button>
          <button v-if="serverAvailable" class="bg-red-800 border-0 p-1" @click="removeTournament(selectToernooi)"
            v-tooltip="'Verwijder dit toernooi definitief van de server'">
            <TrashIcon class="h-6 w-6 text-red-200" />
          </button>
        </div>
        <div class="knoppen flex justify-center" v-if="tournamentStarted">
          <button @click="sluitToernooi" class="bg-yellow-300 text-red-800 btn" v-tooltip="'Sluit toernooi af'"><span
              v-if="thisToernooiID">Sluiten</span><span v-else>Opslaan</span></button>
          <button @click="maakPdf" class="bg-blue-500 text-white btn" v-tooltip="'Stand als PDF'">
            <PrinterIcon class="h-6 w-6 text-white" />
          </button>
          <!-- QR knop -->
          <Qrcode v-if="pdfUrl" :pdfUrl="pdfUrl" />
          <button v-if="pdfUrl" class="bg-green-400 text-red-800 btn"
            v-tooltip="`Stuur een link naar de PDF met WhatsApp \n(Mits geïnstalleerd): ${pdfUrl} `">
            <a :href="`https://wa.me/?text=Bekijk de toernooiuitslag ${niceDate(thisToernooiDatum)}: ${encodeURIComponent(pdfUrl)}`"
              target="_blank">
              <img height="24" width="24" src="https://unpkg.com/simple-icons@latest/icons/whatsapp.svg" />
            </a>
          </button>
          <!-- <Pdf v-if="toernooiSaved" groepsToernooi="groepsToernooi" :ranking="filteredRanking" :toernooien="filteredToernooien"
            :datum="thisToernooiDatum" /> -->

        </div>
      </div>

    </div>
    <div class="toprow" v-if="!tournamentStarted">
      <!-- Lijst sectie -->
      <div v-if="showRanking" class="ranking">
        <Ranking :ranking="filteredRanking" :toernooien="filteredToernooien" :vanaf="vanaf" :tot="tot" />
      </div>

      <div v-if="!showRanking" class="teams">

        <div class="flex gap-2 text-center">
          <input v-model="newTeam" @keyup.enter="addTeam" placeholder="Teamnaam" class="p-1 border teamnaam rounded"
            style="width:50%;" :disabled="toernooiTeams.length > 7" />
          <button @click="addTeam" class="bg-green-800 text-white px-4 py-2 rounded" style="width:50%;"
            :disabled="toernooiTeams.length > 7 || newTeam.trim() === ''">OK</button>
        </div>

        <div class="flex gap-2 items-center p-1">
          <label for="repeatRounds">Aantal volle rondes:</label>
          <input id="repeatRounds" type="number" v-model.number="repeatRounds" min="1" max="2"
            class="border p-2 w-12 rounded" style="width:25%;" />
        </div>
        <div class="flex gap-2 text-center">
          <div>
          </div>
        </div>

        <div v-if="toernooiTeams.length > 0" class="teamlist">
          <h2 class="font-semibold" @click.ctrl="removeTeamsFromToernooi" v-longpress="() => removeTeamsFromToernooi()">
            Lijst:</h2>
          <ul class="list-number list-outside" style="margin-left: 8px">
            <li v-for="(team, index) in toernooiTeams" :key="index" @click.exact="editTeam(index)"
              @click.ctrl="removeTeam(index)" v-longpress="() => removeTeam(index)">
              {{ index + 1 }}: {{ team }}
            </li>
          </ul>
          <p class="text-xs">klik: aanpassen, ctrl/long+klik=wissen</p>
        </div>

      </div>

      <!-- rechter div -->
      <!-- kan ofwel de standaard deelnemers lijst ofwel de stand laten zien -->
      <!-- Afhankelijk of er al dan niet al een schema is gemaakt -->

      <!-- Opgeslagen team lijst -->
      <div id="savedTeams" class="teamlijst rounded" v-if="!tournamentStarted && !showRanking">
        <h2 @click.exact="addAll" @click.ctrl="removeAllStandardTeams">Opgeslagen teams</h2>
        <ul class="dbl">
          <li v-for="(tm, index) in savedTeams" :key="index">
            <p @click.exact="getTeam(tm)" @click.ctrl="removeStandardTeam(tm)"
              v-longpress="() => removeStandardTeam(tm)" :class="teamSelected(tm) ? 'teamSelected' : ''">
              <span v-if="teamSelected(tm)">&#10004;</span> {{ tm }}
            </p>
          </li>
        </ul>
        <p class="text-xs">click: Meedoen, ctrl/long+click=Wissen</p>
      </div>
      <button v-if="toernooiTeams.length > 1" @click="startTournament" class="bg-green-800 text-white px-2 py-2 rounded"
        style="margin-right:2px; width:200px;" :disabled="tournamentStarted"
        v-tooltip="'Bij 8 spelers worden willekeurig twee groepen aangemaakt'">Start toernooi</button>
    </div>

    <Tournament v-if="tournamentStarted" :initialTeams="filteredTeams" :repeatRounds="repeatRounds"
      :edit-mode="editMode" :groepsToernooi="groepsToernooi" :toernooiPlayed="thisToernooiID !== null"
      @reset="handleReset" />



  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import Ranking from "./components/Ranking.vue";
import Tournament from "./components/Tournament.vue";
// import Pdf from './components/Pdf.vue'
import { niceDate, getSemesterText, stripTime } from './utils/dateUtils.js'
import longpress from './directives/longpress.js';
import { useToast } from 'vue-toastification'
import { uitslagPDF } from './utils/pdf/tournamentPDF.js'
import { rankingPDF } from "./utils/pdf/rankingPDF.js";
import jsPDF from "jspdf";
import Qrcode from './components/Qrcode.vue'
import { PrinterIcon, TrashIcon, PencilSquareIcon, InboxIcon } from '@heroicons/vue/24/solid'

import dbService from './services/dbServices.js'

const toast = useToast()
const showRanking = ref(false);
const rankingData = ref([]); // voor de ranking data
const filteredRanking = ref([]);
const serverAvailable = ref(false);
const toernooiSaved = ref(false); // om te weten of het toernooi is Opgeslagen

// const api = import.meta.env.VITE_API_URL || 'http://piweb:54321';
// const api = import.meta.env.VITE_API_URL;
//// console.log ("API URL:", api);
const groepsToernooi = ref(false)  // boolean check groeps/single toernooi
const thisToernooiID = ref(null) // het huidige actieve toernooi
const thisToernooiDatum = ref(new Date()) // de datum van het huidige toernooi
const currentSemester = ref(''); // default value for semester selection
// const thisTNteams = ref([]) // teams van dit toernooi, nog niet gebruikt
const toernooien = ref([])  // array met alle opgeslagen toernooien
const filteredToernooien = ref([]); // toernooien binnen een semester
const selectToernooi = ref('Toernooien')  // voor de DropDown met toernooien  
const newTeam = ref(""); // voor het invulvak TeamNaam
const toernooiTeams = ref([]); // de teams in het huidige toernooi
const savedTeams = ref([]);  // de opgeslagen teams in localStorage
const editMode = ref(false); // boolean om edit mode aan te geven
const tournamentStarted = ref(false); // boolean om aan te geven of het toernooi gestart is
const repeatRounds = ref(1); // aantal herhalingen van de rondes in het huidige toernooi

const pdfUrl = ref(null); // URL van de PDF met uitslag van het huidige toernooi


const vanaf = ref(new Date().toISOString().split('T')[0]);  // startdatum van de periode
const tot = ref(new Date().toISOString().split('T')[0]);

function setPeriode() {
  // Zet de periode van de ranking op basis van de selected semester
  const [year, semester] = currentSemester.value.split('-');
  const startMonth = semester === '1' ? '01' : '07';
  vanaf.value = `${year}-${startMonth}-01`;
  tot.value = `${year}-${semester === '1' ? '06' : '12'}-31`;
  filterToernooien()
//  // console.log("Periode ingesteld van", vanaf.value, "tot", tot.value);
//  // console.log("Toernooien na filteren:", filteredToernooien.value);
  filterRankingByPeriod();
}

async function maakPdf(showPdf = true) {
  pdfUrl.value = await pdfBestaat(niceDate(thisToernooiDatum.value, true));
//  console.log("MaakPDF: PDF bestaat al:", pdfUrl.value);
  if (pdfUrl.value !== null) {
    if (confirm("De PDF bestaat al. Wil je deze opnieuw aanmaken?")) {
      pdfUrl.value = null; // reset de PDF URL
    } else {
      window.open(pdfUrl.value, '_blank'); // open de bestaande PDF
      return; // PDF bestaat al, dus niets meer doen
    }
  }
//  // console.log("Maak PDF voor toernooi:", thisToernooiID.value, "Datum:", thisToernooiDatum.value);
  if (pdfUrl.value !== null) return;
//  // console.log("Geen toernooi geselecteerd, sla eerst het toernooi op.");
  filterToernooien();
  await getRanking();
  filterRankingByPeriod();
  const datum = thisToernooiDatum.value || new Date();
  const baseUrl = "https://www.jota.nl/";
  const doc = new jsPDF();
//  // console.log("PDF document wordt aangemaakt, groepstoernooi:", groepsToernooi.value, "Datum:", datum);
  uitslagPDF(doc, datum, groepsToernooi.value);
  doc.addPage();
  rankingPDF(doc, filteredRanking.value, filteredToernooien.value, thisToernooiDatum.value);
  let tnNaam = "Kraken " + niceDate(thisToernooiDatum.value, true) + ".pdf";
  tnNaam = tnNaam.replace(/\s+/g, '_').toLowerCase(); // vervang spaties door streepjes en zet om naar kleine letters
  savePDF(doc, tnNaam);
  // const blob = doc.output("blob");
  // const formData = new FormData();
  // formData.append("file", blob, tnNaam);
  // const response = await axios.post(`${api}/upload`, formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   }
  // })
//  // console.log("PDF geüpload, response:", response.data);
  // pdfUrl.value = baseUrl + response.data.url
  // pdfUrl.value = pdfUrl.value.replace(/\s+/g, '_').toLowerCase(); // vervang spaties door streepjes en zet om naar kleine letters
  if (showPdf) {
    // open de PDF in een nieuw tabblad
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } 
}

async function savePDF(doc, tnNaam) {
  // Sla de PDF op op de server
  const baseUrl = "https://www.jota.nl/";
  const blob = doc.output("blob");
  const formData = new FormData();
  formData.append("file", blob, tnNaam);
  const response = await dbService.postPDF(formData);
//  // console.log("PDF geüpload, response:", response.data);
  pdfUrl.value = baseUrl + response.data.url;
}

async function pdfBestaat(datum) {
  let pdfNaam = `Kraken ${datum}.pdf`;
  pdfNaam = pdfNaam.replace(/\s+/g, '_').toLowerCase();
  const pdf = "https://www.jota.nl/laurierboom/uploads/pdfs/" + pdfNaam;
  if (await dbService.fetchPDF(pdfNaam)) {
//    // console.log("PDF bestaat al:", pdf);
    return pdf; // <- belangrijk: return hier de waarde
  } else {
//    // console.log("PDF bestaat niet:", pdf);
    return null;
  }
}

function filterToernooien() {
  // Filter de toernooien op basis van de geselecteerde periode
  filteredToernooien.value = toernooien.value
    .filter(tn => {
      const date = new Date(stripTime(tn.datum));
      return date >= new Date(stripTime(vanaf.value)) && date <= new Date(stripTime(tot.value));
    })
    .sort((a, b) => new Date(a.datum) - new Date(b.datum));
//  // console.log("Gefilterde toernooien:", filteredToernooien.value);
}

function getSemesters() {
  const uniqueDates = new Set();
  toernooien.value.forEach(tn => {
    const date = new Date(tn.datum);
    const semester = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 6)}`;
    uniqueDates.add(semester);
  });
  return Array.from(uniqueDates).sort();
}
function getCurrentSemester() {
//  // console.log("Huidige semester:", currentSemester.value);
  setPeriode();
}

function setActiveSemester() {
  // Zet de huidige semester op basis van het huidige toernooi
  if (thisToernooiDatum.value) {
    const date = new Date(thisToernooiDatum.value);
    currentSemester.value = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 6)}`;
//    // console.log("Huidige semester ingesteld:", currentSemester.value);
  } else {
    currentSemester.value = `${new Date().getFullYear()}-${Math.ceil((new Date().getMonth() + 1) / 6)}`;
  }
  setPeriode();
}

function teamSelected(tm) {
  const idx = toernooiTeams.value.indexOf(tm);
  return idx > -1;
}

function toggleEditMode() {
  editMode.value = !editMode.value;
//  // console.log("Edit mode toggled:", editMode.value);
}

async function getSavedToernooien() {
  const response = await dbService.fetchToernooien();
//  // console.log("Toernooien opgehaald:", response.data);
  toernooien.value = response.data;
  selectToernooi.value = 'Toernooien';
}

function editTeam(i) {
  // plaats de team naam in het input veld
//  // console.log(i, "toernooiTeams:", toernooiTeams.value[i], "tournamentStarted:", tournamentStarted);
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
  showRanking.value = !showRanking.value;
}

function allMatchesPlayed() {
  // check of alle matches een uislag hebben in de localeStorage
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");

  if (!m && !gm) return false; // geen matches = niets gespeeld

  const isScoreEntered = (score) =>
    score !== null && score !== undefined && score !== '';

  if (gm) {
    const groupMatches = JSON.parse(gm);
    return groupMatches.every((group) =>
      group.every((match) => {
        return match.every((tafel) =>
          isScoreEntered(tafel.scoreL) || isScoreEntered(tafel.scoreR)
        );
      })
    );
  }

  const matches = JSON.parse(m);
  return matches.every((round) =>
    round.every((match) =>
      isScoreEntered(match.scoreL) || isScoreEntered(match.scoreR)
    )
  );
}

function removeTeamsFromToernooi() {
  // Haal alle toernooiTeams uit de deelnemers lijst 
  toernooiTeams.value = []
}

async function resetApp() {
  // reset de app naar de begin staat
  selectToernooi.value = 'Toernooien';
  thisToernooiID.value = null;
  thisToernooiDatum.value = new Date();
  tournamentStarted.value = false;
  toernooiTeams.value = [];
  newTeam.value = "";
  editMode.value = false;
  resetLocalStorage(true);
  await getSavedToernooien();
  await getSavedTeamsFromApi();
  setActiveSemester();
  filterRankingByPeriod();
  filterToernooien();
  await getRanking();
}

async function sluitToernooi() {
  if (tournamentStarted.value) {
    console.log("Sluit toernooi af, toernooiID:", thisToernooiID.value);
    if (!thisToernooiID.value) {
      // nog niet eerder opgeslagen
      console.log("Toernooi nog niet opgeslagen, nu opslaan.");
      await saveTournament("Toernooi opgeslagen.");
      await getRanking();
      await maakPdf();
    } else {
      // al eerder opgeslagen, dus nu sluiten
      if (editMode.value) {
        // als we in edit mode zijn, dan eerst opslaan
        await saveTournamentChanges("Toernooi opgeslagen.");
        await getRanking();
        await maakPdf(editMode);
      }
      resetApp();
    }
    // zowel bij update als bij nieuw toernooi de ranking en pdf aanpassen
    editMode.value = false;
    thisToernooiID.value = null;  
    resetApp();
  } else {
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

async function selectTournament(tn) {
  thisToernooiID.value = tn;
  // laad de toernooiTeams van het geselecteerde toernooi
  await loadTournament(tn);
  const pdf = await pdfBestaat(niceDate(thisToernooiDatum.value, true));
  pdfUrl.value = pdf;
  toernooiSaved.value = true; // toernooi is geladen, dus opgeslagen
//  // console.log("Datum van het toernooi:", thisToernooiDatum.value);
}

async function loadTournament(tn) {
//  //  console.log("loadTournament", tn)
//  // console.log("Loading tournament data from:", api);
  const response = await dbService.fetchToernooi(tn);
  const data = response.data;
//  //      // console.log("Toernooi data:", data);
  // sla de toernooi data op in localStorage
  thisToernooiID.value = data.id;
  repeatRounds.value = data.repeatRounds || 1;
  // toernooiTeams
  thisToernooiDatum.value = data.datum ? new Date(data.datum) : new Date();
  groepsToernooi.value = data.groepsToernooi !== 0;
//  //      // console.log("tournamentTeams", data.teams);
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
  await standardTeamsToApi()
  await saveTournament("Alles is opgeslagen!")
  await getRanking()
}

async function standardTeamsToApi(msg) {
  // standaard teams

  // if (!serverAvailable.value) return

  const bewaardeTeams = savedTeams.value.map((team) => {
    // verdeel in twee namen van de spelers
    const sp = team.split('/');
    return {
      players: sp,
    };
  });
//  // console.log("saveToApi teams:", bewaardeTeams)
  const sendTeams = {
    teams: bewaardeTeams,
  };
  await dbService.saveStandardTeams(sendTeams)
    // await axios.post(`${api}/standardTeams`, sendTeams)
    .then(() => {
      if (msg) {
        toast.success(msg, {
          position: "top-left",
          timeout: 3000,
        });
      }
//      // console.log("Lijst ook opgeslagen op de server:", bewaardeTeams);
    })
    .catch((error) => {
      toast.error("Fout bij het opslaan van standaard teams: " + error.message, {
        position: "top-left",
        timeout: 3000,
      });
      // console.error("Fout bij het opslaan van standaard teams:", error);
      console.error("Fout bij het opslaan van standaard teams:", error);
    });
}

async function saveTournamentChanges(msg) {
  if (!selectToernooi.value || !serverAvailable.value) return
  if (thisToernooiID.value) {
    await dbService.updateToernooi(thisToernooiID.value, {
      teams: localStorage.getItem("tournamentTeams"),
      matches: localStorage.getItem("tournamentMatches"),
      groups: localStorage.getItem("tournamentGroups"),
      groupMatches: localStorage.getItem("tournamentGroupMatches"),
      finalMatches: localStorage.getItem("tournamentFinalMatches"),
      groepsToernooi: groepsToernooi.value || false,
      repeatRounds: repeatRounds.value || 1,
    });
    if (msg) {
      toast.success(msg, {
        position: "top-right",
        timeout: 3000,
      });
    }
  }
}

async function saveTournament(msg) {

  if (!serverAvailable.value || toernooiSaved.value === true) return

  // tournament
  thisToernooiDatum.value = new Date().toISOString().split('T')[0];
  const tnTeams = localStorage.getItem("tournamentTeams");
  const matches = localStorage.getItem("tournamentMatches");
  const groups = localStorage.getItem("tournamentGroups");
  const groupMatches = localStorage.getItem("tournamentGroupMatches");
  const finalMatches = localStorage.getItem("tournamentFinalMatches");
//  // console.log("saveToApi tournamentTeams:", tnTeams, "groups:", groups, "groupMatches:", groupMatches, "finalMatches:", finalMatches)
  const toernooi = {
    datum: thisToernooiDatum.value,
    teams: tnTeams ? JSON.parse(tnTeams) : [],
    matches: matches ? JSON.parse(matches) : [],
    groups: groups ? JSON.parse(groups) : [],
    groupMatches: groupMatches ? JSON.parse(groupMatches) : [],
    finalMatches: finalMatches ? JSON.parse(finalMatches) : [],
    groepsToernooi: groepsToernooi.value || false,
    repeatRounds: repeatRounds.value || 1,
  };
  await dbService.saveToernooi(toernooi)
    .then(response => {
//      // console.log("Toernooi opgeslagen op de server:", response.data);
      thisToernooiID.value = response.data.id; // sla het ID van het toernooi op
      toernooiSaved.value = true; // toernooi is opgeslagen
      if (msg) {
        toast.success(msg, {
          position: "top-right",
          timeout: 3000,
        });
      }
    })
    .catch(error => {
      console.error("Fout bij het opslaan van toernooi:", error);
      toast.error("Fout bij het opslaan van toernooi: " + error.message, {
        position: "top-left",
        timeout: 3000,
      });
    });

}

async function removeTournament(tn) {

  if (!serverAvailable.value) return

  if (confirm(`Weet je zeker dat je de gegevens van het kraaktoernooi op ${niceDate(tn.datum)} wil verwijderen?`)) {
    await dbService.deleteToernooi(tn.id);
    resetApp();
    toast.success(`Toernooi op ${niceDate(tn.datum)} is verwijderd.`, {
      position: "top-right",
      timeout: 3000,
    });
  }
}

function addTeam() {
  if (newTeam.value.trim()) {
    newTeam.value = cleanTeamName(newTeam.value);
    const idx = toernooiTeams.value.indexOf(newTeam.value);
    // check if element exists
    if (idx < 0) {
      toernooiTeams.value.push(newTeam.value.trim());
    }
    newTeam.value = "";
  }
}

function addAll() {
//  //    //  console.log("addAll ... ")
  savedTeams.value.forEach((tm, index) => {
    getTeam(tm)
  })
}

function getTeam(tm) {
  // is het team al in het toernooi?
  tm = cleanTeamName(tm)
  const idx = toernooiTeams.value.indexOf(tm);
  if (idx < 0) {
    // nee, dus toevoegen
    // addPlayers(tm)   // spelers toevoegen eventueel
    if (toernooiTeams.value.length < 8) {
      toernooiTeams.value.push(tm);
    }
  }
}

function removeStandardTeam(tm) {
  // zit dit team wel in het savedTeams array?
  const idx = savedTeams.value.indexOf(tm);
  // maar niet in het teams array
  const idx2 = toernooiTeams.value.indexOf(tm);
  //. zo ja, weghalen
  if (idx > -1 && idx2 < 0) {
    if (confirm(tm + " definitief verwijderen uit standaardlijst?")) {
      savedTeams.value.splice(idx, 1);
      // en maar gelijk opslaan, anders blijft ie hangen
      localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
      // en ook in de API bijwerken
      standardTeamsToApi("Team verwijderd uit standaardlijst: " + tm);
    }
  }
}

function removeAllStandardTeams() {
  if (confirm("Alle toernooiTeams verwijderen uit de standaardlijst?")) {
    savedTeams.value = []
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
  }
}

function cleanTeamName(thisTeam) {
  // vervang elk mogelijke koppel teken door /
  // en maak hoofdletters van de namen
  let tm = thisTeam.replace(/[^a-zA-Z]+/g, "/");
  var splitStr = tm.toLowerCase().split('/');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join('/');

}

const filteredTeams = computed(() => toernooiTeams.value.map((t) => t.trim()).filter((t) => t));

watch(filteredTeams, (newTeams) => {
  localStorage.setItem("tournamentTeams", JSON.stringify(newTeams));
});

async function startTournament() {
  if (filteredTeams.value.length >= 2) {
    // // controleer of er al een toernooi is voor deze datum
    const nu = new Date(Date.now()).toISOString().split('T')[0];
    const response = await dbService.getToernooiIdByDate(nu);
    const tnID = response.data
    if (tnID) {
      if (confirm("Een toernooi op deze datum bestaat al, deze wordt overschreven, tenzij je nu annuleert!")) {
        resetLocalStorage(false) // reset de data in localStorage (just to be sure), maar niet de geselecteerde teams
        // verwijder het oude toernooi
        await dbService.deleteToernooi(tnID);
        thisToernooiID.value = null; // reset toernooi ID
        selectToernooi.value = 'Toernooien'
      } else {
        // geen nieuw toernooi starten
        // laad dit toernooi opnieuw
        // toernooi.value = nu
        selectTournament(tnID);
//        //        console.log("Toernooi niet gestart, terug naar het toernooi:", tnID);
        return;
      }
    }

    // begin nieuw toernooi
    addTeamsToList() // voeg eventueel nieuwe teams aan de standaardlijst toe
    groepsToernooi.value = false
    if (filteredTeams.value.length >= 7) {
      // optioneel: hier alvast iets opslaan of voorbereiden
      groepsToernooi.value = confirm("Er zijn meer dan 6 teams, wil je twee groepen aanmaken?")
    }
    let rndTxt = 'ronde'
    if (repeatRounds.value > 1) rndTxt = 'rondes'
    let msg = `Het schema wordt gemaakt voor ${repeatRounds.value} ${rndTxt} \nmet ${(filteredTeams.value.length)} teams`
    if (groepsToernooi.value) {
      msg += ', verdeeld over twee groepen'
    }
    msg += `\n\nIs dit de bedoeling?`
    if (confirm(msg)) {
      thisToernooiDatum.value = null
      tournamentStarted.value = true;
      editMode.value = true;
      // sla de toernooiTeams op in localStorage
    }
  } else {
    alert("Voer minimaal 2 teams in.");
  }
}

function addTeamsToList() {
  let teamsSaved = false
  if (!toernooiTeams.value.every((tm) => savedTeams.value.includes(tm))) {
    // check for new items
    // nieuwe tiems in loc storage toevoegen?
    // voeg toernooiTeams toe aan savedTeams als ze (nog) niet bestaan
    toernooiTeams.value.forEach((tm, index) => {
      if (!savedTeams.value.includes(tm)) {
        if (confirm(`${tm} toevoegen aan standaard lijst?`)) {
          savedTeams.value.push(tm);
          teamsSaved = true;
        }
      }
    });
    savedTeams.value.sort();
    // en savedTeams array opslaan
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    // en ook naar de API sturen
    if (teamsSaved) {
      standardTeamsToApi("Standaard teams opgeslagen");
    }
  }
}


function handleReset() {
  // tournamentStarted.value = false;
  // toernooiTeams.value = [];
  // localStorage.removeItem("toernooiTeams");
}

async function getSavedTeamsFromApi() {
//  //    console.log("getSavedTeamsFromApi")
  if (!serverAvailable.value) return; // als de server niet beschikbaar is, doe niets
  // haal de opgeslagen teams op van de API
//  // console.log("Ophalen van opgeslagen teams van de API:", api);  
  await dbService.fetchSavedTeams()
    .then(response => {
      const Lijst = response.data.sort();
//      // console.log("Lijst opgehaald van de API:", Lijst);
      savedTeams.value = []; // reset de lijst
      Lijst.forEach((tm, index) => {
        // check of het team al in de lijst staat
        if (!savedTeams.value.includes(tm.team)) {
          savedTeams.value.push(tm.team);
        }
      });
      localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    })
    .catch(error => {
      console.error("Fout bij het ophalen van teams:", error);
      toast.error("Fout bij het ophalen van teams: " + error.message, {
        position: "bottom-center",
        timeout: 2000,
      });
    });
}

async function isServerActive() {
  // controleer of de server beschikbaar is
  const response = await dbService.checkServer();
  if (response.success) {
    serverAvailable.value = true;
//    // console.log("Server is actief:", response.data);
  } else {
    serverAvailable.value = false;
    console.warn("Server niet beschikbaar:", response.status);
    toast.warning("Server niet beschikbaar: " + response.status, {
      position: "top-center",
      timeout: 3000,
    });
  }
}

const getRanking = async (msg) => {
  // haal de ranking op van de API
  if (!serverAvailable.value) return; // als de server niet beschikbaar is, doe niets
  const response = await dbService.fetchRanking();
  if (response.success) {
    rankingData.value = response.data;
    if (msg) {
      toast.success(msg, {
        position: "top-center",
        timeout: 2000,
      });
    }
  } else {
    console.error("Fout bij het ophalen van ranking:", response.status);
    toast.error("Fout bij het ophalen van ranking: " + response.status, {
      position: "bottom-center",
      timeout: 2000,
    });
  }
};

function filterRankingByPeriod() {
  const start = new Date(vanaf.value)
  const end = new Date(tot.value)
//  //  console.log("Filtering ranking from", start, "to", end);
//  //  console.log("Ranking data:", rankingData.value);
  const result = rankingData.value.map((speler) => {
    const filteredScores = speler.scores.filter((s) => {
      const d = new Date(s.datum)
      return d >= start && d <= end
    })
//    //    console.log("filteredScores:", filteredScores)
    const beste6 = [...filteredScores].sort((a, b) => b.punten - a.punten).slice(0, 6)
    const totaal = beste6.reduce((sum, s) => sum + s.punten, 0)
//    //    console.log("Totaal punten voor", speler.speler, ":", totaal)
    return {
      speler: speler.speler,
      scores: filteredScores,
      totaal,
    }
  })

  result.sort((a, b) => b.totaal - a.totaal)
//  //  console.log("Result:", result)
  let lastTotaal = null
  let plaats = 0
  let echtePlaats = 0

  const metPlaats = result.map((s) => {
    echtePlaats++
    if (s.totaal !== lastTotaal) {
      plaats = echtePlaats
      lastTotaal = s.totaal
    }
    return { ...s, plaats }
  })
//  //  console.log("Filtered ranking:", metPlaats)
  filteredRanking.value = metPlaats
}


onMounted(async () => {
  await isServerActive(); // kijk o de server beschikbaar is
  setActiveSemester(); // zet de huidige semester
  if (serverAvailable.value) {
    toast.success("Welkom bij Jota's Kraak Score \nGegevens zijn opgehaald van de server", {
      position: "top-center",
      timeout: 3000,

    });
    resetLocalStorage(); // reset de localStorage,
    await getSavedTeamsFromApi();
    await getSavedToernooien();
    await getRanking();
    filterToernooien()
    filterRankingByPeriod()
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
    longpress
  }
}
</script>


<style scoped></style>
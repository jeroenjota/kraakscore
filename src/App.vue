<template>
  <div class="max-w-4xl mx-auto space-y-4 maindiv rounded">
    <div class="kop">
      <div class="titelregel flex justify-between items-center  ">
        <h1 class="text-2xl font-bold">
          <span v-if="thisToernooi">Kraaktoernooi</span>
          <span v-else>
            <span class="boom">Laurierboom</span>
            Kraakscore
          </span>
        </h1>
        <div v-if="!thisToernooi && !tournamentStarted && serverAvailable" class="items-center ">
          <select id="toernooien" v-model="toernooi" class="p-1 border bg-white rounded m-1 "
            @change="handleSelectTournament">
            <option value="Oude toernooien" disabled>Oude toernooien</option>
            <option v-for="tn, tnindex in toernooien" :key="tnindex" :value="tn">
              {{ niceDate(tn.datum) }}</option>
          </select>
        </div>
        <p v-if="!thisToernooi" class="copyright">©2025 Jota Services </p>
        <div v-if="toernooi !== 'Oude toernooien'" class="titel regel flex justify-left ">
          <h2 class="text-sm text-white m-1">Gespeeld op {{ niceDate(thisTNdatum) }}</h2>
          <button v-if="!editMode" v-tooltip="'Bewerk dit toernooi'" class="bg-transparent border-0 p-1"
            @click="toggleEditMode">
            <editIcon class="h-6 w-6 text-blue-100" />
          </button>
          <button v-if="editMode" v-tooltip="'Sla dit toernooi op'" class="bg-transparent border-0 p-1"
            @click="saveTournamentChanges">
            <inbox class="h-6 w-6 text-green-300" />
          </button>
          <button v-if="serverAvailable" class="bg-red-800 border-0 p-1" @click="removeTournament(toernooi)"
            v-tooltip="'Verwijder dit toernooi definitief van de server'">
            <trash class="h-6 w-6 text-red-200" />
          </button>
        </div>
        <div class="knoppen flex justify-center" v-if="tournamentStarted">
          <button @click="resetAll" class="bg-yellow-300 text-red-800 px-2 rounded mt-1" v-tooltip="'Sluit toernooi'"
            style="margin-left:2px; margin-right: 2px; width:auto; height:30px; font-size: .9em;"><span
              v-if="thisToernooi">OK</span><span v-else>Klaar</span></button>
          <Pdf :groepsToernooi="groepsToernooi" />

        </div>
      </div>

    </div>
    <div class="toprow" v-if="!tournamentStarted">
      <!-- Lijst sectie -->
      <div class="teams">

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
      <div id="savedTeams" class="teamlijst rounded" v-if="!tournamentStarted">
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
        v-tooltip="'Bij 8 spelers worden willekeurig twee groepen aangemaakt'"
        >Start toernooi</button>
    </div>

    <Tournament v-if="tournamentStarted" :initialTeams="filteredTeams" :repeatRounds="repeatRounds" :edit-mode="editMode"
      :groepsToernooi="groepsToernooi" :toernooiPlayed="thisToernooi !== null" @reset="handleReset" />



  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import Tournament from "./components/Tournament.vue";
import Pdf from './components/Pdf.vue'

import longpress from './directives/longpress.js';
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

import { TrashIcon, PencilSquareIcon, InboxIcon } from '@heroicons/vue/24/solid'
const trash = TrashIcon
const editIcon = PencilSquareIcon
const inbox = InboxIcon

const serverAvailable = ref(false);

// const api = import.meta.env.VITE_API_URL || 'http://piweb:54321';
const api = 'https://jota.nl/api';
const groepsToernooi = ref(false)
const thisToernooi = ref(null)
const thisTNdatum = ref(new Date())
// const thisTNteams = ref([]) // teams van dit toernooi, nog niet gebruikt
const toernooien = ref([])
const toernooi = ref('Oude toernooien')
const newTeam = ref("");
const toernooiTeams = ref([]);
const savedTeams = ref([]);
const editMode = ref(false);
const tournamentStarted = ref(false);
const repeatRounds = ref(1);

function teamSelected(tm) {
  const idx = toernooiTeams.value.indexOf(tm);
  return idx > -1;
}

function toggleEditMode() {
  editMode.value = !editMode.value;
  // console.log("Edit mode toggled:", editMode.value);
}

async function getSavedToernooien() {
  const response = await axios.get(`${api}/toernooien`)
   // console.log("Toernooien opgehaald:", response.data);
  toernooien.value = response.data
  toernooi.value = 'Oude toernooien'
}

function editTeam(i) {
  // plaats de team naam in het input veld
  // console.log(i, "toernooiTeams:", toernooiTeams.value[i], "tournamentStarted:", tournamentStarted);
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

function niceDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}



function allMatchesPlayed() {
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");

  if (!m && !gm) return false; // geen matches = niets gespeeld

  const isScoreEntered = (score) =>
    score !== null && score !== undefined && score !== '';

  if (gm) {
    const groupMatches = JSON.parse(gm);
    return groupMatches.every((group) =>
      group.every((match) =>
        isScoreEntered(match.scoreL) && isScoreEntered(match.scoreR)
      )
    );
  }

  const matches = JSON.parse(m);
  return matches.every((round) =>
    round.every((match) =>
      isScoreEntered(match.scoreL) && isScoreEntered(match.scoreR)
    )
  );
}

function removeTeamsFromToernooi() {
  // Haal alle toernooiTeams uit de deelnemers lijst 
  toernooiTeams.value = []
}
function resetAll() {
  // reset de deelnemende toernooiTeams , de scores en het schema
  // alleen als er een schema is ;-)
  if (thisToernooi.value) {
    resetLocalStorage()
    toernooi.value = 'Oude toernooien'
    editMode.value = false
    return
  }
  if (tournamentStarted.value) {
    // nogmaals bevestigen
    if (!allMatchesPlayed()) {
      if (confirm("Nog niet alle matches zijn gespeeld, wil je het toernooi toch resetten?")) {
        resetLocalStorage()
        toernooi.value = 'Oude toernooien'
        editMode.value = false
        return
      } else {
        // terug naar het toernooi
        return
      }
      //else do nothing, dus terug naar het toernooi
    } else {
      // alle wedstrijden gespeeld, dus opslaan?
      if (serverAvailable.value && tournamentHasData() && !thisToernooi.value) {
        if (confirm("Wil je het toernooi opslaan voor later?")) {
          saveToApi();
          editMode.value = false
        }
      }
      if (confirm("Weet je zeker dat het toernooi wilt sluiten?")) {
        resetLocalStorage()
        editMode.value = false
        toernooi.value = 'Oude toernooien'
      }
    }
  }
}

function resetLocalStorage() {
  // reset de local storage
  localStorage.removeItem("tournamentTeams");
  localStorage.removeItem("matches");
  localStorage.removeItem("tournamentGroups");
  localStorage.removeItem("tournamentGroupMatches");
  localStorage.removeItem("tournamentMatches");
  localStorage.removeItem("tournamentFinalMatches");
  localStorage.removeItem("repeatRounds");
  toernooiTeams.value = [];
  newTeam.value = "";
  tournamentStarted.value = false;
  groepsToernooi.value = false;
  repeatRounds.value = 1;
  thisToernooi.value = null;
  getSavedToernooien()
}

function handleSelectTournament() {
  if (toernooi.value && toernooi.value.id) {
    selectTournament(toernooi.value.id);
  }
}


function selectTournament(tn) {
  thisToernooi.value = tn;
  // console.log("selectTournament", thisToernooi.value);
  // laad de toernooiTeams van het geselecteerde toernooi
  loadTournament(tn);
}

async function loadTournament(tn) {
  //  console.log("loadTournament", tn)
  // console.log("Loading tournament data from:", api);
  await axios.get(`${api}/toernooien/${tn}`)
    .then(response => {
      const data = response.data;
      // console.log("Toernooi data:", data);
      // sla de toernooi data op in localStorage
      thisToernooi.value = data.id;
      repeatRounds.value = data.repeatRounds || 1;
      // toernooiTeams
      thisTNdatum.value = data.datum ? new Date(data.datum) : new Date();
      groepsToernooi.value = data.groepsToernooi !== 0;
      // console.log("tournamentTeams", data.teams);
      localStorage.setItem("tournamentTeams", data.teams);
      if (!groepsToernooi.value || groepsToernooi.value === 0) {
        localStorage.setItem("tournamentMatches", data.matches);
      } else {
        localStorage.setItem("tournamentGroups", data.groups);
        localStorage.setItem("tournamentGroupMatches", data.groupMatches);
        localStorage.setItem("tournamentFinalMatches", data.finalMatches);
      }
      tournamentStarted.value = true;
    })
    .catch(error => {
      console.error("Fout bij het laden van toernooi:", error);
    });
}

function saveToApi() {
  standardTeamsToApi()
  saveTournament()
}

async function standardTeamsToApi() {
  // standaard teams

  // if (!serverAvailable.value) return

  const bewaardeTeams = savedTeams.value.map((team) => {
    // verdeel in twee namen van de spelers
    const sp = team.split('/');
    return {
      players: sp,
    };
  });
  // console.log("saveToApi teams:", bewaardeTeams)
  const sendTeams = {
    teams: bewaardeTeams,
  };
  await axios.post(`${api}/standardTeams`, sendTeams)
    .then(() => {
      toast.success("Teams opgeslagen op de server", {
        position: "top-left",
        timeout: 3000,
      });
      // console.log("Lijst ook opgeslagen op de server:", bewaardeTeams);
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

function tournamentHasData() {
  // controleer of er al data is voor dit toernooi
  const matches = localStorage.getItem("tournamentMatches");
  const groups = localStorage.getItem("tournamentGroups");
  const groupMatches = localStorage.getItem("tournamentGroupMatches");
  const finalMatches = localStorage.getItem("tournamentFinalMatches");
  //  // console.log("tournamentHasData tnTeams:", "matches:", matches, "groups:", groups, "groupMatches:", groupMatches, "finalMatches:", finalMatches)
  return matches || groups || groupMatches || finalMatches;
}
// controleer of er al data is voor dit toernooi

async function saveTournamentChanges() {
  if (!toernooi.value || !serverAvailable.value) return
  let msg = 'Weet je zeker daty je wijzigingen wilt opslaan?'
  if (thisTNdatum.value !== new Date().toISOString().split('T')[0]) {
    msg = `Weet je zeker dat je de wijzigingen voor het toernooi wilt opslaan?`
    msg += `\nLet op: Dit toenooi is gespeeld op ${niceDate(thisTNdatum.value)}`;
  }
  if (confirm(msg)) {
    try {
      // console.log("Opslaan van toernooi wijzigingen...");
      const response = await axios.put(`${api}/toernooien/${toernooi.value.id}`, {
        teams: localStorage.getItem("tournamentTeams"),
        matches: localStorage.getItem("tournamentMatches"),
        groups: localStorage.getItem("tournamentGroups"),
        groupMatches: localStorage.getItem("tournamentGroupMatches"),
        finalMatches: localStorage.getItem("tournamentFinalMatches"),
        groepsToernooi: groepsToernooi.value || false,
        repeatRounds: repeatRounds.value || 1,
      })

      toast.success('Toernooi succesvol bijgewerkt!', {
        position: "top-right",
        timeout: 3000,
      });
      toggleEditMode()
    } catch (error) {
      console.error("Fout bij het opslaan van wijzigingen:", error)
      toast.error('Opslaan mislukt.' + error.message)
    }
  }
}


async function saveTournament() {

  if (!serverAvailable.value) return

  // tournament

  const tnTeams = localStorage.getItem("tournamentTeams");
  const matches = localStorage.getItem("tournamentMatches");
  const groups = localStorage.getItem("tournamentGroups");
  const groupMatches = localStorage.getItem("tournamentGroupMatches");
  const finalMatches = localStorage.getItem("tournamentFinalMatches");
  //  // console.log("saveToApi tournamentTeams:", tnTeams, "groups:", groups, "groupMatches:", groupMatches, "finalMatches:", finalMatches)
  const toernooi = {
    datum: new Date().toISOString().split('T')[0],
    teams: tnTeams ? JSON.parse(tnTeams) : [],
    matches: matches ? JSON.parse(matches) : [],
    groups: groups ? JSON.parse(groups) : [],
    groupMatches: groupMatches ? JSON.parse(groupMatches) : [],
    finalMatches: finalMatches ? JSON.parse(finalMatches) : [],
    groepsToernooi: groepsToernooi.value || false,
    repeatRounds: repeatRounds.value || 1,
  };
  await axios.post(`${api}/toernooien`, toernooi)
    .then(() => {
      toast.success("Toernooi opgeslagen op de server", {
        position: "top-right",
        timeout: 3000,
      });
      //            console.log("Toernooi opgeslagen op de server");
    })
    .catch((error) => {
      toast.error("Fout bij het opslaan van toernooi: " + error.message, {
        position: "top-left",
        timeout: 3000,
      });
      console.error("Fout bij het opslaan van toernooi:", error);
    });

}

async function removeTournament(tn) {

  if (!serverAvailable.value) return

  if (confirm(`Weet je zeker dat je de gegevens van het kraaktoernooi op ${niceDate(tn.datum)} wil verwijderen?`)) {
    axios.delete(`${api}/toernooien/${tn.id}`)
      .then(() => {
        // Verwijder het toernooi uit de lijst
        toernooien.value = toernooien.value.filter(t => t.id !== tn.id);
      })
      .catch((error) => {
        console.error("Fout bij het verwijderen van toernooi:", error);
      });
    resetLocalStorage();
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
  //    //  //  //  console.log("addAll ... ")
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
      standardTeamsToApi();
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
    const tnID = await axios.get(`${api}/tournamentID?datum=${nu}`)
      .then(response => {
        console.log("Toernooi ID opgehaald:", response.data.id);
        return response.data.id;
      })
      .catch(error => {
        console.error("Fout bij het ophalen van toernooi ID:", error);
      });
    console.log("tnID:", tnID);
    if (tnID) {
      if (confirm("Een toernooi op deze datum bestaat al, deze wordt overschreven, tenzij je nu annuleert!")) {
        // verwijder het oude toernooi
        await axios.delete(`${api}/toernooien/${tnID}`)
          .then(() => {
            console.log("Oud toernooi verwijderd:", tnID);
            thisToernooi.value = null; // reset toernooi ID
            // resetAll();
            // resetLocalStorage()
            toernooi.value = 'Oude toernooien'
            return; // stop hier
          })
          .catch(error => {
            console.error("Fout bij het verwijderen van oud toernooi:", error);
          });
      } else {
        // stop hier, dus geen toernooi starten
        // laad dit toernooi opnieuw
        toernooi.value = nu
        selectTournament(tnID);
        // await loadTournament(tnID);
        console.log("Toernooi niet gestart, terug naar het toernooi:", tnID);
        return;
      }
    }
    addTeamsToList() // voeg eventueel nieuwe teams aan de standaardlijst toe
    groepsToernooi.value = false
    if (filteredTeams.value.length >= 7) {
      // optioneel: hier alvast iets opslaan of voorbereiden
      groepsToernooi.value = confirm("Er zijn meer dan 6 teams, wil je twee groepen aanmaken?")
    }
    let rndTxt = 'ronde'
    if (repeatRounds.value > 1) rndTxt = 'rondes'
    let msg = `Het schema wordt gemaakt voor ${repeatRounds.value} ${rndTxt} \nmet ${(filteredTeams.value.length)} teams`
    if (groepsToernooi) {
      msg += ', verdeeld over twee groepen'
    }
    msg += `\n\nIs dit de bedoeling?`
    if (confirm(msg)) {
      thisTNdatum.value = null
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
        if (confirm(`${tm} toevoegen aan standaard lijst?`))
          savedTeams.value.push(tm);
        teamsSaved = true
      }
    });
    savedTeams.value.sort();
    // en savedTeams array opslaan
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    // en ook naar de API sturen
    standardTeamsToApi();
    if (teamsSaved) {
      toast.info("Nieuwe teams toegevoegd aan de standaard lijst", {
        position: "top-center",
        timeout: 3000,
      });
    }
  }
}


function handleReset() {
  // tournamentStarted.value = false;
  // toernooiTeams.value = [];
  // localStorage.removeItem("toernooiTeams");
}

async function getSavedTeamsFromApi() {
  //    console.log("getSavedTeamsFromApi")
  await axios.get(`${api}/savedTeams`)
    .then(response => {
      const Lijst = response.data.sort();
      //            console.log("Lijst opgehaald van de API:", savedTeams);
      Lijst.forEach((tm, index) => {
        // check of het team al in de lijst staat
        if (!savedTeams.value.includes(tm)) {
          savedTeams.value.push(tm.team);
        }
      });
      localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    })
    .catch(error => {
      console.error("Fout bij het ophalen van teams:", error);
      toast.error("Fout bij het ophalen van teams: " + error.message, {
        position: "bottom",
        timeout: 2000,
      });
    });
}

async function isServerActive() {
  // controleer of de server beschikbaar is
  try {
    const res = await axios.get(`${api}/ping`, { timeout: 3000 });

    // console.log("API server beschikbaar:", res.status);
    if (res.status === 200) {
      serverAvailable.value = true;
    }
  } catch (error) {
    console.warn('API server niet bereikbaar:', error.message);
    toast.warning("Server niet bereikbaar: " + error.message, {
      position: "top-center",
      timeout: 3000,
    });
    serverAvailable.value = false;
  }
}

onMounted(async () => {
  //  console.log("api = ", api);
  await isServerActive(); // kijk o de server beschikbaar is
  if (serverAvailable.value) {
    // haal de opgeslagen teams op van de API
    await getSavedTeamsFromApi();
    await getSavedToernooien();
    toast.success("Welkom bij Jota's Kraak Score \nGegevens zijn opgehaald van de server", {
      position: "top-center",
      timeout: 5000,
    });
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
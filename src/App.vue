<template>
  <div class="max-w-4xl mx-auto space-y-4 maindiv rounded">
    <div class="kop">
      <div class="titelregel flex justify-between items-center  ">
          <h1 class="text-2xl font-bold">
            <span v-if="thisToernooi">Kraaktoernooi</span>
            <span v-else> 
            Laurierboom Kraakscore
            </span>
          </h1>
          <div v-if="!thisToernooi && !tournamentStarted" class="items-center ">
            <select name="" id="toernooien" v-model="toernooi" class="p-1 border bg-white rounded m-1 ">
              <option value="Oude toernooien" disabled>Oude toernooien</option>
              <option @click="selectTournament(tn.id)" v-for="tn, tnindex in toernooien" :key="tnindex" :value="tn">
                {{ niceDate(tn.datum) }}</option>
            </select>
          </div>
          <p v-if="!thisToernooi"  class="copyright">©2025 Jota Services </p>
          <div v-if="toernooi !== 'Oude toernooien'" class="titel regel flex justify-left ">
            <h2 class="text-sm text-white m-1">Gespeeld op {{ niceDate(thisTNdatum) }}</h2>
            <button class="bg-transparent border-0 p-1" @click="removeTournament(toernooi)" text="Verwijder toernooi">
              <trash class="h-6 w-6 text-white" />
            </button>
          </div>
        <div class="knoppen flex justify-center" v-if="tournamentStarted">
          <button @click="resetAll" class="bg-red-500 text-white px-2 rounded mt-2"
            style="margin-left:2px; width:auto; height:30px; font-size: .9em;"><span v-if="thisToernooi">OK</span><span
              v-else>Reset</span></button>
          <Pdf :groepsToernooi="groepsToernooi" />

        </div>
      </div>

    </div>
    <div class="toprow" v-if="!tournamentStarted">
      <!-- Teams sectie -->
      <div class="teams">

        <div class="flex gap-2 text-center">
          <input v-model="newTeam" @keyup.enter="addTeam" placeholder="Teamnaam" class="p-1 border teamnaam rounded"
            style="width:50%;" :disabled="teams.length > 7" />
          <button @click="addTeam" class="bg-blue-500 text-white px-4 py-2 rounded" style="width:50%;"
            :disabled="teams.length > 7">Meedoen</button>
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

        <div v-if="teams.length > 0" class="teamlist">
          <h2 class="font-semibold" @click.ctrl="removeTeamsFromToernooi" v-longpress="() => removeTeamsFromToernooi()">
            Teams:</h2>
          <ul class="list-number list-outside" style="margin-left: 8px">
            <li v-for="(team, index) in teams" :key="index" @click.exact="editTeam(index)"
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
        <h2 @click.exact="addAll" @click.ctrl="delAll">Opgeslagen teams</h2>
        <ul class="dbl">
          <li v-for="(tm, index) in savedTeams" :key="index">
            <p @click.exact="getTeam(tm)" @click.ctrl="delTeam(tm)" v-longpress="() => delTeam(tm)"
              :class="teamSelected(tm) ? 'teamSelected' : ''">
              <span v-if="teamSelected(tm)">&#10004;</span> {{ tm }}
            </p>
          </li>
        </ul>
        <p class="text-xs">click: Meedoen, ctrl/long+click=Wissen</p>
      </div>
      <button v-if="teams.length > 1" @click="startTournament" class="bg-green-500 text-white px-2 py-2 rounded"
        style="margin-right:2px; width:200px;" :disabled="tournamentStarted"
        title="Bij 8 spelers worden willekeurig twee groepen aangemaakt">Start toernooi</button>
    </div>

    <Tournament v-if="tournamentStarted" :initialTeams="filteredTeams" :repeatRounds="repeatRounds"
      :groepsToernooi="groepsToernooi" :toernooiPlayed="thisToernooi !== null" @reset="handleReset" />



  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import Tournament from "./components/Tournament.vue";
import Pdf from './components/Pdf.vue'

import longpress from './directives/longpress.js';
import axios from 'axios'


import { TrashIcon } from '@heroicons/vue/24/solid'
const trash = TrashIcon

const api = "http://piweb:54321";
const groepsToernooi = ref(false)
const thisToernooi = ref(null)
const thisTNdatum = ref(new Date())
// const thisTNteams = ref([]) // teams van dit toernooi, nog niet gebruikt
const toernooien = ref([])
const toernooi = ref('Oude toernooien')
const newTeam = ref("");
const teams = ref([]);
const savedTeams = ref([])

const tournamentStarted = ref(false);
const repeatRounds = ref(1);

function teamSelected(tm) {
  const idx = teams.value.indexOf(tm);
  return idx > -1;
}

async function savedToernooien() {
  const response = await axios.get(`${api}/toernooien`)
  // console.log("Toernooien opgehaald:", response.data);
  toernooien.value = response.data
  toernooi.value
}

function editTeam(i) {
  // plaats de team naam in het input veld
  ////  //  //  //  console.log(i, "teams:", teams.value[i], "tournamentStarted:", tournamentStarted);
  if (!tournamentStarted.value) {
    newTeam.value = teams.value[i];
    // tijdelijk weghalen uit array
    teams.value.splice(i, 1);
  }
}
function removeTeam(i) {
  // haal het team uit de lijst met gekozen teams
  if (!tournamentStarted.value) {
    teams.value.splice(i, 1);
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

function removeTeamsFromToernooi() {
  // Haal alle teams uit de deelnemers lijst 
  teams.value = []
}
function resetAll() {
  // reset de deelnemende teams , de scores en het schema
  // alleen als er een schema is ;-)
  if (tournamentStarted.value) {
    // nogmaals bevestigen
    if (!thisToernooi.value) {
      if (confirm("Wil je het toernooi opslaan voor later?")) {
        saveToApi();
      }

    }
    if (confirm("Weet je zeker dat het toernooi wilt sluiten?")) {
      resetLocalStorage()
      toernooi.value = 'Oude toernooien'
    }
  }
}

function resetLocalStorage() {
  // reset de local storage
  localStorage.removeItem("teams");
  localStorage.removeItem("tournamentGroups");
  localStorage.removeItem("tournamentGroupMatches");
  localStorage.removeItem("tournamentMatches");
  localStorage.removeItem("tournamentFinalMatches");
  localStorage.removeItem("repeatRounds");
  teams.value = [];
  newTeam.value = "";
  tournamentStarted.value = false;
  groepsToernooi.value = false;
  repeatRounds.value = 1;
  thisToernooi.value = null;
  savedToernooien()
}

function selectTournament(tn) {
  thisToernooi.value = tn;
  console.log("selectTournament", thisToernooi.value);
  // laad de teams van het geselecteerde toernooi
  loadTournament(tn);
}

async function loadTournament(tn) {
  console.log("loadTournament", tn)
  await axios.get(`${api}/toernooien/${tn}`)
    .then(response => {
      const data = response.data;
      // sla de toernooi data op in localStorage
      thisToernooi.value = data.id;
      repeatRounds.value = data.repeatRounds || 1;
      // teams
      thisTNdatum.value = data.datum ? new Date(data.datum) : new Date();
      groepsToernooi.value = data.groepsToernooi !== 0 ;
      console.log("teams", data.teams);
      localStorage.setItem("teams", data.teams);
      if (!groepsToernooi.value) {
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
  console
  saveTeams()

  saveTournament()
}

async function saveTeams() {
  // teams
  const bewaardeTeams = savedTeams.value.map((team) => {
    // verdeel in twee namen van de spelers
    const sp = team.split('/');
    return {
      players: sp,
    };
  });
  ////  console.log("saveToApi teams:", bewaardeTeams)
  const sendTeams = {
    teams: bewaardeTeams,
  };
  await axios.post(`${api}/teams`, sendTeams)
    .then(() => {
      ////      console.log("Teams ook opgeslagen op de server:", bewaardeTeams);
    })
    .catch((error) => {
      console.error("Fout bij het opslaan van teams:", error);
    });
}

async function saveTournament() {
  // tournament
  const tnteams = localStorage.getItem("teams");
  const matches = localStorage.getItem("tournamentMatches");
  const groups = localStorage.getItem("tournamentGroups");
  const groupMatches = localStorage.getItem("tournamentGroupMatches");
  const finalMatches = localStorage.getItem("tournamentFinalMatches");
  console.log("saveToApi teams:", tnteams, "groups:", groups, "groupMatches:", groupMatches, "finalMatches:", finalMatches)
  const toernooi = {
    datum: new Date().toISOString().split('T')[0],
    teams: tnteams || '',
    matches: matches || '',
    groups: groups || '',
    groupMatches: groupMatches || '',
    finalMatches: finalMatches || '',
    groepsToernooi: groepsToernooi.value || false,
    repeatRounds: repeatRounds.value || 1,
  }
  await axios.post(`${api}/toernooien`, toernooi)
    .then(() => {
      ////      console.log("Toernooi opgeslagen op de server");
    })
    .catch((error) => {
      console.error("Fout bij het opslaan van toernooi:", error);
    });

}

async function removeTournament(tn) {
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
    const idx = teams.value.indexOf(newTeam.value);
    // check if element exists
    if (idx < 0) {
      teams.value.push(newTeam.value.trim());
    }
    newTeam.value = "";
  }
}

function addAll() {
  ////  //  //  //  console.log("addAll ... ")
  savedTeams.value.forEach((tm, index) => {
    getTeam(tm)
  })
}

function getTeam(tm) {
  // is het team al in het toernooi?
  tm = cleanTeamName(tm)
  const idx = teams.value.indexOf(tm);
  if (idx < 0) {
    // nee, dus toevoegen
    // addPlayers(tm)   // spelers toevoegen eventueel
    if (teams.value.length < 8) {
      teams.value.push(tm);
    }
  }
}

function delTeam(tm) {
  // zit dit team wel in het savedTeams array?
  const idx = savedTeams.value.indexOf(tm);
  // maar niet in het teams array
  const idx2 = teams.value.indexOf(tm);
  //. zo ja, weghalen
  if (idx > -1 && idx2 < 0) {
    if (confirm(tm + " definitief verwijderen uit standaardlijst?")) {
      savedTeams.value.splice(idx, 1);
      // en maar gelijk opslaan, anders blijft ie hangen
      localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    }
  }
}

function delAll() {
  if (confirm("Alle teams verwijderen uit de standaardlijst?")) {
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

const filteredTeams = computed(() => teams.value.map((t) => t.trim()).filter((t) => t));

watch(filteredTeams, (newTeams) => {
  localStorage.setItem("teams", JSON.stringify(newTeams));
});

function startTournament() {
  if (filteredTeams.value.length >= 2) {
    // Init groepen alvast bij 8+ teams, kan later handig zijn
    addTeamsToList() // voeg eventueel nieuwe teams aan de standaardlijst toe
    groepsToernooi.value = false
    if (filteredTeams.value.length >= 7) {
      // optioneel: hier alvast iets opslaan of voorbereiden
      ////      //      //      // bv. // console.log('Init groepen voor finale logica')
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
    }
  } else {
    alert("Voer minimaal 2 teams in.");
  }
}

function addTeamsToList() {
  if (!teams.value.every((tm) => savedTeams.value.includes(tm))) {
    // check for new items
    // nieuwe tiems in loc storage toevoegen?
    // voeg teams toe aan savedTeams als ze (nog) niet bestaan
    teams.value.forEach((tm, index) => {
      if (!savedTeams.value.includes(tm)) {
        if (confirm(`${tm} toevoegen aan standaard lijst?`))
          savedTeams.value.push(tm);
      }
    });
    savedTeams.value.sort();
    // en savedTeams array opslaan
    localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
  }
}


function handleReset() {
  // tournamentStarted.value = false;
  // teams.value = [];
  // localStorage.removeItem("teams");
}

async function getSavedTeamsFromApi() {
  ////  console.log("getSavedTeamsFromApi")
  await axios.get(`${api}/savedTeams`)
    .then(response => {
      const Teams = response.data.sort();
      ////      console.log("Teams opgehaald van de API:", savedTeams);
      Teams.forEach((tm, index) => {
        // check of het team al in de lijst staat
        if (!savedTeams.value.includes(tm)) {
          savedTeams.value.push(tm.team);
        }
      });
      localStorage.setItem("savedTeams", JSON.stringify(savedTeams.value));
    })
    .catch(error => {
      console.error("Fout bij het ophalen van teams:", error);
    });
}

onMounted(() => {
  const saved = localStorage.getItem("savedTeams");
  if (saved) {
    console.log("Teams gevonden in localStorage:", saved);
    teams.value = JSON.parse(saved);
  } else {
    console.log("Geen teams gevonden in localStorage, wacht op API data...");
    getSavedTeamsFromApi()
  }
  savedToernooien()

  const tmpTeams = JSON.parse(localStorage.getItem("teams"));
  // const savedPlayers = JSON.parse(localStorage.getItem('players'))
  const oldTeams = JSON.parse(localStorage.getItem("savedTeams"));
  if (oldTeams) savedTeams.value = oldTeams.sort();
  if (tmpTeams) teams.value = tmpTeams;
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
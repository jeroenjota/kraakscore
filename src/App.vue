<template>
  <div class="max-w-4xl mx-auto space-y-4 maindiv rounded">
    <div class="kop">
      <div class="titelregel flex justify-between ">
        <h1 class="text-2xl font-bold">
          Laurierboom Kraakscore
          <p class="copyright">©2025 Jota Services </p>
        </h1>
        <div class="knoppen flex justify-center" v-if="tournamentStarted">
          <button @click="resetAll" class="bg-red-500 text-white px-2 rounded mt-2"
            style="margin-left:2px; width:auto; height:30px; font-size: .9em;">Reset</button>
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

        <div v-if="teams.length > 0" class="teamlist">
          <h2 class="font-semibold" @click.ctrl="removeAll" v-longpress="() => removeAll()">Teams:</h2>
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
            <!-- voeg een team toe aan de deelnemerslijst (klik) of haal hem weg uit de standaardlijst (ctrl+klik)-->
          </li>
        </ul>
        <p class="text-xs">click: Meedoen, ctrl/long+click=Wissen</p>
      </div>
      <button @click="startTournament" class="bg-green-500 text-white px-2 py-2 rounded"
        style="margin-right:2px; width:200px;" :disabled="tournamentStarted"
        title="Bij 8 spelers worden willekeurig twee groepen aangemaakt">Start toernooi</button>
    </div>

    <Tournament v-if="tournamentStarted" :initialTeams="filteredTeams" :repeatRounds="repeatRounds"
          :groepsToernooi="groepsToernooi" @reset="handleReset" />



  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import Tournament from "./components/Tournament.vue";
import Pdf from './components/Pdf.vue'

import longpress from './directives/longpress.js';
import axios from "axios";

const api = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const groepsToernooi = ref(false)

const newTeam = ref("");
const teams = ref([]);
const savedTeams = ref([])

const tournamentStarted = ref(false);
const repeatRounds = ref(1);

function teamSelected(tm) {
  const idx = teams.value.indexOf(tm);
  return idx > -1;
}

function editTeam(i) {
  // plaats de team naam in het input veld
//  //  //  console.log(i, "teams:", teams.value[i], "tournamentStarted:", tournamentStarted);
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


function removeAll() {
  // Haal alle teams uit de deelnemers lijst 
  teams.value = []
}
function resetAll() {
  // reset de deelnemende teams , de scores en het schema
  // alleen als er een schema is ;-)
  if (tournamentStarted.value) {
    // nogmaals bevestigen
    if (confirm("Weet je zeker dat je de scores en het schema wilt resetten?")) {
      if (confirm("Wil je het toernooi opslaan voor later?")) {
        addToDB();
      }
      teams.value = [];
      tournamentStarted.value = false
      repeatRounds.value = 1;
      localStorage.removeItem("teams");
      localStorage.removeItem("tournamentGroups");
      localStorage.removeItem("tournamentGroupMatches");
      localStorage.removeItem("tournamentMatches");
      localStorage.removeItem("tournamentFinalMatches");
      localStorage.removeItem("repeatRounds");
    }
  }
}

const addToDB = () => {
  // teams
  const players = teams.value.split('/')
  console.log("addToDB teams:", players)
  axios.post(`${process.env.VUE_APP_BASE_API}/teams`, {
    spelers: players,
  })



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
//  //  //  console.log("addAll ... ")
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

function delAll(){
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
//      //      // bv. // console.log('Init groepen voor finale logica')
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
  tournamentStarted.value = false;
  teams.value = [];
  localStorage.removeItem("teams");
}

onMounted(() => {
  const saved = localStorage.getItem("teams");
  if (saved) {
    teams.value = JSON.parse(saved);
  }
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
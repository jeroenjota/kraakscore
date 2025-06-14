<template>
  <div class="max-w-4xl mx-auto space-y-4 maindiv">
    <div class="kop">
      <h1 class="text-2xl font-bold">
        Laurierboom Kraakscore
        <p class="copyright">©2025 Jota Services</p>
      </h1>
    </div>
    <div>
      <div class="toprow">
        <div class="teams">
          <div class="flex gap-2">
            <input
              v-model="newTeam"
              @keyup.enter="addTeam"
              placeholder="Teamnaam"
              class="p-1 border teamnaam rounded"
            />
            <button @click="addTeam" class="bg-blue-500 text-white px-4 py-2 rounded">Meedoen</button>
          </div>

          <div class="flex gap-2 items-center p-1">
            <label for="repeatRounds">Aantal volle rondes:</label>
            <input
              id="repeatRounds"
              type="number"
              v-model.number="repeatRounds"
              min="1"
              class="border p-2 w-12 rounded"
            />
          </div>

          <div>
            <h2 v-if="teams.length > 0" class="font-semibold">Teams:
              <small v-if="!schedule.length">ctrl+klik=weghalen)</small>
            </h2>
            <ul class="list-number list-inside" style="margin-left: 10px">
              <li
                v-for="(team, index) in teams"
                :key="index"
                @click.exact="editTeam(index)"
                @click.ctrl="removeTeam(index)"
              >
                {{ team }}
              </li>
            </ul>
          </div>

          <div class="flex gap-2">
            <button @click="generateSchedule" class="bg-green-500 text-white px-4 py-2 rounded">Genereer schema</button>
            <button @click="resetAll" class="bg-red-500 text-white px-4 py-2 rounded">Reset</button>
          </div>
        </div>
        <!-- rechter div -->
        <div id="lastTeams" class="stand" v-if="!schedule.length">
          <h2>Standaard teams</h2>
          <ul class="dbl">
            <li v-for="tm in lastTeams">
              <p @click.ctrl="delTeam(tm)" @click.exact="getTeam(tm)">{{ tm }}</p>
            </li>
          </ul>
          <small>click = meedoen / ctrl+click = verwijderen</small>
        </div>
        <div id="standTeams" class="stand" v-if="schedule.length">
          <h2 class="text-xl font-semibold">Stand</h2>
          <table v-if="standings.length" class="mt-2">
            <thead>
              <tr>
                <th class="border px-2"></th>
                <th class="border px-2">Team</th>
                <th class="border px-2">#</th>
                <th class="border px-2">Punten</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(team, i) in standings" :key="team.team">
                <td class="border px-2">{{ i + 1 }}</td>
                <td class="border px-2">{{ team.team }}</td>
                <td class="border px-2 text-center">{{ team.played }}</td>
                <td class="border px-2 text-center">{{ team.goalsFor }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="schema">
        <div v-if="schedule.length">
          <h2 class="text-xl font-semibold">Speelschema</h2>
          <table class="rondes w-full">
            <tbody>
              <div v-for="(round, roundIndex) in schedule" :key="roundIndex" class="mt-4">
                <td colspan="7">Ronde {{ roundIndex + 1 }}</td>
                <tr v-for="(match, matchIndex) in round" :key="matchIndex">
                  <td class="border px-2">T{{ matchIndex + 1 }}</td>
                  <td class="border px-2 team">
                    {{ match.home }}
                  </td>
                  <td class="border px-2">vs</td>
                  <td class="border px-2 team">{{ match.away }}</td>
                  <td class="border px-2">
                    <input v-model.number="match.homeScore" @change="saveResults" type="number" class="w-16" />
                  </td>
                  <td class="border px-2">-</td>
                  <td class="border px-2">
                    <input v-model.number="match.awayScore" @change="saveResults" type="number" class="w-16" />
                  </td>
                </tr>
              </div>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import "../public/styles.css";

const newTeam = ref("");
const teams = ref([]);
const lastTeams = ref([]);
const schedule = ref([]);
const repeatRounds = ref(1);

onMounted(() => {
  const savedTeams = JSON.parse(localStorage.getItem("teams"));
  const oldTeams = JSON.parse(localStorage.getItem("lastTeams"));
  const savedSchedule = JSON.parse(localStorage.getItem("schedule"));
  const savedRounds = JSON.parse(localStorage.getItem("repeatRounds"));
  if (oldTeams) lastTeams.value = oldTeams;
  if (savedTeams) teams.value = savedTeams;
  if (savedSchedule) schedule.value = savedSchedule;
  if (savedRounds) repeatRounds.value = savedRounds;
  console.log("Teams: " + teams.value);
});

function addTeam() {
  if (newTeam.value.trim()) {
    const idx = teams.value.indexOf(newTeam.value);
    if (idx < 0) {
      teams.value.push(newTeam.value.trim());
    }
    newTeam.value = "";
  }
}
function editTeam(i) {
  // plaats de team naam in het input veld
  if (schedule.value.length === 0) {
    newTeam.value = teams.value[i];
    teams.value.splice(i, 1);
  }
}
function removeTeam(i) {
  // haal het team uit de lijst met gekozen teams
  if (schedule.value.length === 0) {
    teams.value.splice(i, 1);
  }
}

function getTeam(tm) {
  // is het team al in het toernooi?
  const idx = teams.value.indexOf(tm);
  if (idx < 0) {
    teams.value.push(tm);
    // newTeam.value = tm
  }
}

function delTeam(tm) {
  const idx = lastTeams.value.indexOf(tm);
  if (idx > -1) {
    lastTeams.value.splice(idx, 1);
  }
}

function generateSchedule() {
  const inputTeams = [...teams.value];
  if (inputTeams.length % 2 !== 0) {
    inputTeams.push("BYE");
  }
  const totalRounds = inputTeams.length - 1;
  const halfSize = inputTeams.length / 2;
  const baseRounds = [];

  for (let round = 0; round < totalRounds; round++) {
    const matches = [];
    for (let i = 0; i < halfSize; i++) {
      const home = inputTeams[i];
      const away = inputTeams[inputTeams.length - 1 - i];
      if (home !== "BYE" && away !== "BYE") {
        matches.push({ home, away, homeScore: null, awayScore: null });
      }
    }
    baseRounds.push(matches);
    inputTeams.splice(1, 0, inputTeams.pop());
  }

  const fullSchedule = [];
  for (let i = 0; i < repeatRounds.value; i++) {
    const roundCopy = JSON.parse(JSON.stringify(baseRounds));
    fullSchedule.push(...roundCopy);
  }

  schedule.value = fullSchedule;
  saveResults();
}

function saveResults() {
  localStorage.setItem("teams", JSON.stringify(teams.value));
  localStorage.setItem("schedule", JSON.stringify(schedule.value));
  localStorage.setItem("repeatRounds", JSON.stringify(repeatRounds.value));
}

function resetAll() {
  if (schedule.value.length > 0) {
    if (!teams.value.every(tm => lastTeams.value.includes(tm))){
      // check for new items
      if (confirm("Nieuwe teams toevoegen aan standaardlijst?")) {
        // voeg teams toe aan lastTeams als ze (nog) niet bestaan
        teams.value.forEach((tm, index) => {
          if (!lastTeams.value.includes(tm)) {
            lastTeams.value.push(tm);
          }
        });
      }
      // en opslaan
      localStorage.setItem("lastTeams", JSON.stringify(teams.value));
    }
    if (confirm("Weet je zeker dat je de scores en het schema wilt resetten?")) {
      teams.value = [];
      schedule.value = [];
      repeatRounds.value = 1;
      localStorage.removeItem("teams");
      localStorage.removeItem("schedule");
      localStorage.removeItem("repeatRounds");
    }
  }
}

const standings = computed(() => {
  const table = {};
  teams.value.forEach((team) => {
    table[team] = {
      team,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };
  });

  for (const round of schedule.value) {
    for (const match of round) {
      const { home, away, homeScore, awayScore } = match;
      if (homeScore == null || awayScore == null) continue;

      const homeTeam = table[home];
      const awayTeam = table[away];

      homeTeam.played++;
      awayTeam.played++;

      homeTeam.goalsFor += homeScore;
      homeTeam.goalsAgainst += awayScore;

      awayTeam.goalsFor += awayScore;
      awayTeam.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        homeTeam.wins++;
        homeTeam.points += 3;
        awayTeam.losses++;
      } else if (homeScore < awayScore) {
        awayTeam.wins++;
        awayTeam.points += 3;
        homeTeam.losses++;
      } else {
        homeTeam.draws++;
        awayTeam.draws++;
        homeTeam.points += 1;
        awayTeam.points += 1;
      }
    }
  }

  return Object.values(table).sort((a, b) => {
    return b.goalsFor - a.goalsFor;
    // const goalDiffA = a.goalsFor - a.goalsAgainst;
    // const goalDiffB = b.goalsFor - b.goalsAgainst;
    // return goalDiffB - goalDiffA;
  });
});
</script>

<style></style>

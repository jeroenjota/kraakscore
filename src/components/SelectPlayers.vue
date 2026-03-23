<!--
  SelectPlayers.vue – Player selection & new-player entry.
  Two dropdown lists let the user pick two players to form a team.
  Players already assigned to a tournament team are filtered out.
  A separate input field allows adding brand-new player names.
-->
<!--  Select Players component -->
<template>
  <!-- twee kolommen met spelers namen om teams samen te stellen -->
  <div class="h-auto w-full p-1">
    <div
      v-tooltip="{
        content:
          'Selecteer twee spelers om een team samen te stellen en klik OK.',
        html: true,
      }">
      <h2 class="text-center text-lg text-blue-700">Nieuw team</h2>
      <div class="justify-left flex gap-2 p-1">
        <!-- linker kolom -->
        <div class="flex-2">
          <select
            v-model="selectedLeft"
            name="speler1"
            id="speler1"
            class="w-full rounded border bg-gray-100 p-1 text-black">
            <option
              v-for="(speler, index) in optionsLeft"
              :key="index"
              :value="speler">
              {{ speler }}
            </option>
          </select>
        </div>
        <div>/</div>
        <div class="flex-2">
          <select
            v-model="selectedRight"
            name="speler2"
            id="speler2"
            class="w-full rounded border bg-gray-100 p-1 text-black">
            <option
              v-for="(speler, index) in optionsRight"
              :key="index"
              :value="speler">
              {{ speler }}
            </option>
          </select>
        </div>
        <button
          class="button flex-1 rounded border bg-blue-400 p-1 text-white"
          :disabled="!bothPlayersEntered()"
          @click="addTeam(selectedLeft, selectedRight)">
          OK
        </button>
      </div>
    </div>

    <div
      class="justify-left flex gap-2 p-1"
      v-tooltip="{
        content:
          'Voeg een nieuwe speler toe aan de lijst. De naam moet uniek zijn!',
        html: true,
      }">
      <div class="flex-2">
        <label class="w-full text-sm text-black" for="newPlayer"
          >Nwe speler</label
        >
      </div>
      <div>:</div>
      <div class="flex-2">
        <input
          id="newPlayer"
          v-model="newPlayerName"
          class="w-full rounded border bg-gray-100 p-0 text-black"
          type="text" />
      </div>
      <button
        @click="addNewPlayer"
        class="button flex-1 rounded border bg-blue-400 p-1 text-white"
        :disabled="!newPlayerName">
        OK
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { cleanTeamName } from "../utils/editUtils";

const props = defineProps({
  // Define any props if needed
  spelers: {
    type: Array,
    default: () => [],
  },
  toernooiTeams: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["addTeam"]);
const newPlayerName = ref("");

// Selected player names per column
const selectedLeft = ref(null);
const selectedRight = ref(null);
const teams = ref([]);

// Filtered options: exclude the player chosen in the other dropdown
// and any player already in the tournament
const optionsLeft = computed(() =>
  props.spelers.filter(
    (name) =>
      name !== selectedRight.value &&
      !props.toernooiTeams.some((team) => team.includes(name)),
  ),
);

const optionsRight = computed(() =>
  props.spelers.filter(
    (name) =>
      name !== selectedLeft.value &&
      !props.toernooiTeams.some((team) => team.includes(name)),
  ),
);

// Combine two selected players into a normalised team name and emit it
function addTeam(left, right) {
  console.log("Toevoegen team:", left, right);
  if (left && right) {
    const team = cleanTeamName(`${left} / ${right}`);
    teams.value.push(team);
    console.log("Teams, team", teams.value, team);
    emit("addTeam", team);
    // reset selectie
    selectedLeft.value = null;
    selectedRight.value = null;
  } else {
    alert("Selecteer beide spelers voordat je een team toevoegt.");
  }
}

function bothPlayersEntered() {
  return selectedLeft.value && selectedRight.value;
}

// Add a new player name to the global list (if unique)
function addNewPlayer() {
  if (newPlayerName.value.trim() !== "") {
    if (!props.spelers.includes(newPlayerName.value.trim())) {
      props.spelers.push(newPlayerName.value.trim());
      newPlayerName.value = "";
      if (!selectedLeft.value) {
        selectedLeft.value = props.spelers[props.spelers.length - 1];
      } else if (!selectedRight.value) {
        selectedRight.value = props.spelers[props.spelers.length - 1];
      }
    } else {
      alert("Deze speler bestaat al.");
      newPlayerName.value = "";
    }
  } else {
    alert("Voer een geldige naam in.");
  }
}
</script>

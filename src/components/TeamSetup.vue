<!--
  TeamSetup.vue – Team entry panel.
  Shows the SelectPlayers component for composing new teams, a repeat-rounds
  input, and the numbered list of teams added to the current tournament.
  Click a team to edit; Ctrl+click or long-press to remove.
-->
<template>
    <!-- Player selector for building a new team -->
    <div class="flex w-full flex-row gap-2 rounded">
      <SelectPlayers
        :spelers="spelers"
        :toernooiTeams="toernooiTeams"
        @addTeam="$emit('addTeam', $event)" />
    </div>
    <div
      class="flex items-center gap-2 p-1"
      v-tooltip="{ content: 'Alleen bij minder dan 7 teams', html: true }">
      <label for="repeatRounds">Aantal volle rondes:</label>
      <input
        id="repeatRounds"
        type="number"
        :value="repeatRounds"
        @input="$emit('update:repeatRounds', parseInt($event.target.value))"
        min="1"
        :max="toernooiTeams.length > 6 ? 1 : 2"
        class="w-12 rounded border p-2"
        style="width: 25%"
        data-testid="repeat-rounds-input" />
    </div>
    <div class="flex gap-2 text-center">
      <div></div>
    </div>
    <div v-if="toernooiTeams.length > 0" class="teamlist" data-testid="team-list">
      <h2
        class="font-semibold"
        @click.ctrl="$emit('removeTeamsFromToernooi')"
        v-longpress="() => $emit('removeTeamsFromToernooi')">
        Lijst:
      </h2>
      <ul class="list-number list-outside" style="margin-left: 8px">
        <li
          v-for="(team, index) in toernooiTeams"
          :key="index"
          @click.exact="$emit('editTeam', index)"
          @click.ctrl="$emit('removeTeam', index)"
          v-longpress="() => $emit('removeTeam', index)">
          {{ index + 1 }}: {{ team }}
        </li>
      </ul>
      <p class="text-xs">Klik op team om te verwijderen</p>
    </div>
  </div>
</template>

<script setup>
import SelectPlayers from './SelectPlayers.vue'
import longpress from '../directives/longpress.js'

defineProps({
  spelers: Array,
  toernooiTeams: Array,
  repeatRounds: Number,
  showRanking: Boolean,
})

defineEmits([
  'addTeam',
  'editTeam',
  'removeTeam',
  'removeTeamsFromToernooi',
  'update:repeatRounds',
])
</script>
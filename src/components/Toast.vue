<script setup lang="ts">
defineProps({
  message: {
    required: false,
    type: string,
  },
  visibility: {
    required: true,
    type: Boolean,  
  },
});
</script>

<template>
  <div v-if="visibility" 
    class="toast z-50 fixed top-4 right-4 flex items-center gap-4 mb-4 text-gray-200 transition-all duration-[3000ms] w-80 overflow-hidden">
    <div class="p-3 w-full rounded-tl-none">
      <div class="flex flex-col">
        <div class="toast__title text-sm text-green-800">Success</div>
        <div class="toast__text text-sm text-green-500">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast{
  box-shadow: 0px 4px 14px 0px rgba(0,0,0,0.18);
  border-radius: 5px 0px 0px 5px;
  border-left: 7px solid #1fac66;
  width:429px
}
</style>
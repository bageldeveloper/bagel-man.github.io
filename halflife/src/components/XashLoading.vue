<template>
  <div class="half window xash-loading" name="Loading">
    <div class="xash-loading__container">
      {{ loadingProgress }}%
      <progress :value="loadingProgress" max="100" />
    </div>
  </div>
</template>

<script setup>
import { useXashStore } from "@/stores/store";
import { storeToRefs } from "pinia";
const store = useXashStore();
const { loadingProgress } = storeToRefs(store);
</script>

<style scoped lang="scss">
.xash-loading {
  &__container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
}
</style>

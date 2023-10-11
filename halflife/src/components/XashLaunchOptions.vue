<template>
  <div class="window" name="Launch Options">
    <div class="box">
      <input class="xash-launch-options" type="text" v-model="launchOptions" />
    </div>
  </div>
</template>

<script setup>
import { useXashStore } from "@/stores/store";
import { storeToRefs } from "pinia";
const store = useXashStore();
const { launchOptions } = storeToRefs(store);
</script>

<style scoped lang="scss">
.xash-launch-options {
  width: 100%;
}
</style>

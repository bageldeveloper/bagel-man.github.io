<template>
  <div class="xash-settings">
    <div v-if="!loading">
      <XashGames />
      <XashLoadZip />
      <XashLaunchOptions />
      <XashStart />
      <Attribution />
    </div>
    <XashLoading v-if="loading" />
  </div>
</template>

<script setup>
import { useXashStore } from "@/stores/store";
import { storeToRefs } from "pinia";
import XashGames from "@/components/XashGames.vue";
import XashStart from "@/components/XashStart.vue";
import XashLoading from "@/components/XashLoading.vue";
import XashLaunchOptions from "@/components/XashLaunchOptions.vue";
import Attribution from "@/components/Attribution.vue";
import XashLoadZip from "@/components/XashLoadZip.vue";
const store = useXashStore();
const { loading } = storeToRefs(store);
</script>

<style scoped lang="scss">
.xash-settings {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  margin: 10px;
  flex-direction: column;
}
</style>

<template>
  <XashSettings v-if="showXashSettingUI" />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import XashSettings from "@/components/XashSettings.vue";
import { useXashStore } from "@/stores/store";
import { init } from "../hl-engine-js/lib/hl-engine.js";

import { storeToRefs } from "pinia";
const store = useXashStore();
const { showXashSettingUI } = storeToRefs(store);
const { setStatus } = store;

onMounted(() => {
  init({
    canvas: document.getElementById("canvas") || null,
    location: import.meta.env.DEV ? "" : "/webXash",
    setStatus: setStatus,
  });
});
</script>

<style scoped lang="scss">
.start {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>

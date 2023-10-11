<template>
  <div class="window" name="Start">
    <div class="box">
      <div class="options">
        <label for="fullscreen">
          <input
            v-model="fullScreen"
            id="fullscreen"
            name="fullscreen"
            type="checkbox"
          />
          Fullscreen
        </label>
      </div>
      <button class="start-button" @click="start" :disabled="!selectedGame">
        Start
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useXashStore } from "@/stores/store";
import { storeToRefs } from "pinia";
import setCanvasLoading from "@/utils/setCanvasLoading";

const store = useXashStore();
const { selectedGame, fullScreen } = storeToRefs(store);
const { downloadZip, startXash } = store;

const start = async () => {
  setCanvasLoading();
  const zip = await downloadZip();
  if (!zip) {
    alert("Selected game could not be loaded!");
    return;
  }
  await startXash(zip);
};
</script>

<style scoped lang="scss">
.start-button {
  text-align: center;
  width: 100%;
}

.options {
  margin-bottom: 16px;
  label {
    cursor: pointer;
  }
}
</style>

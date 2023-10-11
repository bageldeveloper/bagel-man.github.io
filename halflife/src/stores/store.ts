import { ref } from "vue";
import { defineStore } from "pinia";
import getZip from "@/utils/getZip";
import {
  FINAL_PROGRESS_STR,
  getInitialLoadingProgress,
} from "@/utils/getInitialLoadingProgress";
// @ts-ignore
import { start } from "../../hl-engine-js/lib/hl-engine";

const DEFAULT_ARGS = [`+hud_scale`, `2.5`, "+volume", "0.5"];

const WINDOW_ARGS = [
  `-height`,
  `${window.innerHeight}`,
  `-width`,
  `${window.innerWidth}`,
  ...DEFAULT_ARGS,
];

const FULLSCREEN_ARGS = [
  `-height`,
  `${window.outerHeight}`,
  `-width`,
  `${window.outerWidth}`,
  ...DEFAULT_ARGS,
];

export const useXashStore = defineStore("xash", () => {
  const memory = ref(150);
  const selectedGame = ref("");
  const loading = ref(true);
  const loadingProgress = ref(50);
  const showXashSettingUI = ref(true);
  const launchOptions = ref("");
  const fullScreen = ref(false);

  const downloadZip = async (): Promise<ArrayBuffer | undefined> => {
    if (!selectedGame.value) return;
    loadingProgress.value = 0;
    loading.value = true;
    return await getZip(
      selectedGame.value,
      (progress: number) => (loadingProgress.value = progress)
    );
  };

  const setStatus = (text: string) => {
    loadingProgress.value = getInitialLoadingProgress(text);
    if (text === FINAL_PROGRESS_STR) {
      loading.value = false;
    }
    console.info(text);
  };

  const startXash = (zip: ArrayBuffer) => {
    const launchArgs = fullScreen.value ? FULLSCREEN_ARGS : WINDOW_ARGS;
    const params = {
      mod: selectedGame.value?.split?.(".")?.[0],
      map: null,
      filesystem: "RAM",
      fullscreen: fullScreen.value,
      zip: zip,
      args: [...launchArgs, ...launchOptions.value.split(" ")],
    };
    start(params);
    loading.value = false;
    showXashSettingUI.value = false;
  };

  return {
    memory,
    selectedGame,
    loading,
    loadingProgress,
    showXashSettingUI,
    launchOptions,
    fullScreen,
    downloadZip,
    setStatus,
    startXash,
  };
});

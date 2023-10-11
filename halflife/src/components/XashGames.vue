<template>
  <div class="window" name="Games">
    <div class="box inset">
      <p
        v-for="game in gameList"
        class="menu-item"
        :class="{ 'menu-item--selected': selectedGame === game.packageName }"
        :key="game.name"
        @click="selectedGame = game.packageName"
      >
        {{ game.name }}
      </p>
    </div>
  </div>
</template>

<script setup>
import gameList from "@/config/games";
import { useXashStore } from "@/stores/store";
import { storeToRefs } from "pinia";

const store = useXashStore();

const { selectedGame } = storeToRefs(store);
</script>

<style scoped lang="scss"></style>

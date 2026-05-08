<template>
  <div class="page">
    <AppHeader />
    <GoldSavings />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import GoldSavings from "@/components/savings/GoldSavings.vue";
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #fff7fb, #eef6ff);
  font-family: system-ui;
}
</style>
<template>
  <div class="ap-page">
    <AppHeader />
    <main class="shell">
      <GoldSavings />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import GoldSavings from "@/components/savings/GoldSavings.vue";
</script>

<style scoped>
.shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px 20px 112px;
  box-sizing: border-box;
}
</style>

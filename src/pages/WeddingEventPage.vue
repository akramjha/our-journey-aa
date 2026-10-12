<template>
  <div class="ap-page">
    <div class="shell">
      <AppHeader />
      <WeddingEventPlanner />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import WeddingEventPlanner from "@/components/wedding/WeddingEventPlanner.vue";
</script>

<style scoped>
.shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px 20px 112px;
}

@media (min-width: 900px) {
  .shell {
    padding: 24px 32px 120px;
  }
}

@media (max-width: 420px) {
  .shell {
    padding: 12px 16px 104px;
  }
}
</style>

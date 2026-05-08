<template>
  <div class="page">
    <AppHeader />
    <ChecklistModule />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import ChecklistModule from "@/components/checklist/ChecklistModule.vue";
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #fff7fb, #eef6ff);
  font-family: system-ui;
}

@media (max-width: 768px) {
  .page {
    padding: 18px;
  }
}
</style>
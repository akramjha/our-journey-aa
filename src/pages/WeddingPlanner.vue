<template>
  <div class="page">
    <AppHeader />

    <header class="header">
      <h1>💍 {{ coupleSettings.partner1 }} & {{ coupleSettings.partner2 }} Wedding Journey</h1>
      <p>Planning forever, together ✨</p>
      <div class="header-actions">
        <button class="settings-btn" @click="$router.push('/settings')">
          ⚙️ Couple Settings
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-card">
      Loading our journey dashboard... 💕
    </div>

    <template v-else>
      <div class="grid">
        <div class="card romantic">
          <h2>💖 Days Together</h2>
          <p class="big">{{ daysTogether }} days</p>
          <p class="small">and still counting ❤️</p>
        </div>

        <div class="card romantic">
          <h2>💍 Engagement Countdown</h2>
          <p class="big">{{ engagementDaysLeft }} days</p>
          <p class="small">until our engagement day ✨</p>
        </div>

        <div class="card romantic">
          <h2>⏳ Wedding Countdown</h2>
          <p class="big">{{ daysLeft }} days</p>
          <p class="small">until our big day 💍</p>
        </div>

        <div class="card romantic">
          <h2>💌 Love Note</h2>
          <p class="note">{{ todayNote }}</p>
        </div>

        <div class="card romantic">
          <h2>📑 Checklist Progress</h2>
          <p class="big">{{ checklistProgress }}%</p>
          <p class="small">
            {{ completedChecklist }} / {{ totalChecklist }} completed
          </p>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: checklistProgress + '%' }"
            ></div>
          </div>
        </div>

        <div class="card romantic">
          <h2>👰🏻‍♀️ Wedding Progress</h2>
          <p class="big">{{ weddingProgress }}%</p>
          <p class="small">
            {{ completedWeddingItems }} / {{ totalWeddingItems }} completed
          </p>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: weddingProgress + '%' }"
            ></div>
          </div>
        </div>

        <div class="card romantic">
          <h2>💰 Savings Progress</h2>
          <p class="big">{{ savingsProgress }}%</p>
          <p class="small">
            {{ totalGoldWeight.toFixed(4) }}g / {{ totalSavingsTarget }}g
          </p>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: savingsProgress + '%' }"
            ></div>
          </div>
        </div>

        <div class="card romantic">
          <h2>🕊️ Nikah & Tunang</h2>
          <p class="big">{{ totalNikahItems + totalTunangItems }} items</p>
          <p class="small">
            {{ totalNikahItems }} nikah • {{ totalTunangItems }} tunang
          </p>
        </div>
      </div>

      <UpcomingTasks />

      <PhotoboothMemories />

      <div class="module-grid">
        <div class="module-card">
          <h2>💰 Gold Savings</h2>
          <p>Track our wedding gold contributions</p>
          <button @click="$router.push('/savings')">Open Module →</button>
        </div>

        <div class="module-card">
          <h2>💍 Tunang Planner</h2>
          <p>Plan venue, attire, hantaran, food, decor and services</p>
          <button @click="$router.push('/tunang')">Open Module →</button>
        </div>

        <div class="module-card">
          <h2>📑 Borang Checklist</h2>
          <p>Track nikah documents, forms and submissions</p>
          <button @click="$router.push('/checklist')">Open Module →</button>
        </div>

        <div class="module-card">
          <h2>🕊️ Nikah Planner</h2>
          <p>Track hantaran, attire, decor and nikah preparation</p>
          <button @click="$router.push('/nikah')">Open Module →</button>
        </div>

        <div class="module-card">
          <h2>👰🏻‍♀️🤵🏻 Wedding Event</h2>
          <p>Plan venue, booth, decor, doorgift and wedding day services</p>
          <button @click="$router.push('/wedding')">Open Module →</button>
        </div>
      </div>
    </template>

    <QuickAddModal />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import PhotoboothMemories from "@/components/dashboard/PhotoboothMemories.vue";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks.vue";
import QuickAddModal from "@/components/dashboard/QuickAddModal.vue";
import { useDashboard } from "@/composables/useDashboard";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { listenCoupleSettings } from "@/services/coupleService";

const {
  loading,

  totalChecklist,
  completedChecklist,
  checklistProgress,

  totalWeddingItems,
  completedWeddingItems,
  weddingProgress,

  totalNikahItems,
  totalTunangItems,

  totalSavingsTarget,
  totalGoldWeight,
  savingsProgress,
} = useDashboard();

const coupleSettings = ref({
  partner1: "Akram",
  partner2: "Aina",
  startDate: "2024-01-01",
  engagementDate: "2026-06-01",
  weddingDate: "2026-12-31",
  loveNote: "Every step we take is closer to our dream 💍"
});

let unsubscribeSettings: (() => void) | null = null;

onMounted(() => {
  unsubscribeSettings = listenCoupleSettings((data) => {
    coupleSettings.value = {
      ...coupleSettings.value,
      ...data
    };
  });
});

onUnmounted(() => {
  if (unsubscribeSettings) unsubscribeSettings();
});

const today = new Date();

const daysTogether = computed(() => {
  const start = new Date(coupleSettings.value.startDate);

  return Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
});

const engagementDaysLeft = computed(() => {
  const engagement = new Date(coupleSettings.value.engagementDate);

  return Math.max(
    0,
    Math.floor(
      (engagement.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
});

const daysLeft = computed(() => {
  const wedding = new Date(coupleSettings.value.weddingDate);

  return Math.max(
    0,
    Math.floor(
      (wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
});

const todayNote = computed(() => coupleSettings.value.loveNote);

const loveNotes = [
  "I can’t wait to build forever with you 💖",
  "Every step we take is closer to our dream 💍",
  "You are my safest place ❤️",
  "Our future looks beautiful together ✨",
];
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40px;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: linear-gradient(135deg, #fff7fb, #eef6ff);
}

.header {
  text-align: center;
  margin-bottom: 36px;
}

.header {
  position: relative;
  text-align: center;
  margin-bottom: 36px;
}

.header-actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.settings-btn {
  border: none;
  padding: 11px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9a9e, #a0c4ff);
  color: white;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(255, 154, 158, 0.25);
  transition: 0.25s ease;
}

.settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(255, 154, 158, 0.35);
}

.header h1 {
  font-size: 42px;
  margin-bottom: 10px;
}

.header p {
  font-size: 18px;
  color: #777;
}

.loading-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  color: #d63384;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-bottom: 36px;
  align-items: stretch;
}

.card {
  min-height: 180px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.romantic {
  background: linear-gradient(135deg, #fff0f5, #fffaf0);
  border: 1px solid rgba(255, 182, 193, 0.4);
}

.card h2 {
  font-size: 20px;
  line-height: 1.25;
  margin: 0;
}

.big {
  font-size: 26px;
  font-weight: 800;
  margin: 18px 0 8px;
}

.small {
  font-size: 13px;
  color: #777;
}

.note {
  font-style: italic;
  color: #d63384;
  line-height: 1.6;
  margin-top: 18px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #ffe1ec;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 18px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff7eb3, #a0c4ff);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 36px;
}

.module-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.module-card h2 {
  color: #d63384;
}

.module-card p {
  color: #666;
  line-height: 1.5;
}

.module-card button {
  margin-top: 18px;
  padding: 12px 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff9a9e, #a0c4ff);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: 0.25s ease;
}

.module-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(255, 154, 158, 0.35);
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .page {
    padding: 18px;
  }

  .header h1 {
    font-size: 30px;
  }

  .header p {
    font-size: 15px;
  }

  .grid,
  .module-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card,
  .module-card {
    padding: 20px;
    border-radius: 22px;
  }

  .card {
    min-height: auto;
  }
}
</style>
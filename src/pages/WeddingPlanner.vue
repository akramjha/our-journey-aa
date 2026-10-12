<template>
  <div class="ap-page">
    <div class="shell">
      <AppHeader />

      <header class="title-block">
        <div>
          <h1>{{ coupleSettings.partner1 }} &amp; {{ coupleSettings.partner2 }}</h1>
          <p>Planning forever, together.</p>
        </div>

        <RouterLink to="/settings" class="icon-btn" aria-label="Couple settings">
          <AppIcon name="sliders" />
        </RouterLink>
      </header>

      <p v-if="loading" class="loading" role="status">Loading your journey…</p>

      <div v-else class="columns">
        <div class="column">
          <section class="group countdown" aria-label="Countdowns">
            <div class="stat">
              <span class="stat-label">Wedding</span>
              <span class="stat-value">{{ daysLeft }}<small>days</small></span>
              <span class="stat-note">until our big day</span>
            </div>

            <div class="stat">
              <span class="stat-label">Engagement</span>
              <span class="stat-value">{{ engagementDaysLeft }}<small>days</small></span>
              <span class="stat-note">until we celebrate</span>
            </div>

            <div class="stat">
              <span class="stat-label">Together</span>
              <span class="stat-value">{{ daysTogether }}<small>days</small></span>
              <span class="stat-note">and still counting</span>
            </div>
          </section>

          <blockquote class="note">{{ todayNote }}</blockquote>

          <section aria-labelledby="progress-title">
            <div class="section-head">
              <h2 id="progress-title">Progress</h2>
            </div>

            <ul class="group list">
              <li v-for="item in progressRows" :key="item.label" class="progress-row">
                <div class="progress-top">
                  <span class="row-title">{{ item.label }}</span>
                  <span class="row-value">{{ item.percent }}%</span>
                </div>

                <div
                  class="bar"
                  role="progressbar"
                  :aria-valuenow="item.percent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="item.label"
                >
                  <div
                    class="bar-fill"
                    :style="{ width: (ready ? item.percent : 0) + '%' }"
                  ></div>
                </div>

                <span class="row-detail">{{ item.detail }}</span>
              </li>

              <li class="progress-row plain">
                <div class="progress-top">
                  <span class="row-title">Nikah &amp; Tunang</span>
                  <span class="row-value">{{ totalNikahItems + totalTunangItems }} items</span>
                </div>
                <span class="row-detail">
                  {{ totalNikahItems }} nikah · {{ totalTunangItems }} tunang
                </span>
              </li>
            </ul>
          </section>

          <UpcomingTasks />
        </div>

        <div class="column">
          <PhotoboothMemories />

          <section aria-labelledby="planners-title">
            <div class="section-head">
              <h2 id="planners-title">Planners</h2>
            </div>

            <nav class="group list" aria-label="Planners">
              <RouterLink
                v-for="module in modules"
                :key="module.to"
                :to="module.to"
                class="module-row"
              >
                <span class="module-icon"><AppIcon :name="module.icon" /></span>
                <span class="module-text">
                  <span class="row-title">{{ module.title }}</span>
                  <span class="row-detail">{{ module.description }}</span>
                </span>
                <span class="chevron"><AppIcon name="chevron-right" /></span>
              </RouterLink>
            </nav>
          </section>
        </div>
      </div>
    </div>

    <QuickAddModal />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import type { IconName } from "@/components/ui/AppIcon.vue";
import PhotoboothMemories from "@/components/dashboard/PhotoboothMemories.vue";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks.vue";
import QuickAddModal from "@/components/dashboard/QuickAddModal.vue";
import { useDashboard } from "@/composables/useDashboard";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
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
  loveNote: "Every step we take is closer to our dream"
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

// Bars start empty and fill once the dashboard has data: the page's one entrance.
const ready = ref(false);

watch(
  loading,
  (isLoading) => {
    if (!isLoading) requestAnimationFrame(() => (ready.value = true));
  },
  { immediate: true }
);

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

const clamp = (value: number) =>
  Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

const progressRows = computed(() => [
  {
    label: "Borang checklist",
    percent: clamp(checklistProgress.value),
    detail: `${completedChecklist.value} of ${totalChecklist.value} completed`
  },
  {
    label: "Wedding plan",
    percent: clamp(weddingProgress.value),
    detail: `${completedWeddingItems.value} of ${totalWeddingItems.value} completed`
  },
  {
    label: "Gold savings",
    percent: clamp(savingsProgress.value),
    detail: `${totalGoldWeight.value.toFixed(4)}g of ${totalSavingsTarget.value}g`
  }
]);

const modules: {
  to: string;
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    to: "/savings",
    title: "Gold Savings",
    description: "Track our wedding gold contributions",
    icon: "coins"
  },
  {
    to: "/tunang",
    title: "Tunang Planner",
    description: "Venue, attire, hantaran, food, decor and services",
    icon: "gem"
  },
  {
    to: "/checklist",
    title: "Borang Checklist",
    description: "Nikah documents, forms and submissions",
    icon: "checklist"
  },
  {
    to: "/nikah",
    title: "Nikah Planner",
    description: "Hantaran, attire, decor and nikah preparation",
    icon: "book"
  },
  {
    to: "/wedding",
    title: "Wedding Event",
    description: "Venue, booth, decor, doorgift and day-of services",
    icon: "sparkles"
  }
];
</script>

<style scoped>
.shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px 20px 112px;
}

.title-block {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 0 4px 28px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 6vw, 48px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.title-block p {
  margin: 6px 0 0;
  color: var(--ap-label-2);
  font-size: 17px;
}

.icon-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
  color: var(--ap-label);
  font-size: 20px;
  transition: transform 0.2s var(--ap-ease);
}

.icon-btn:hover {
  transform: scale(1.05);
}

.icon-btn:active {
  transform: scale(0.94);
}

.loading {
  margin: 48px 0;
  text-align: center;
  color: var(--ap-label-2);
  font-size: 17px;
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 32px;
}

.column {
  display: grid;
  align-content: start;
  gap: 32px;
  min-width: 0;
}

.group {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  border-radius: var(--ap-radius);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
  overflow: hidden;
}

.section-head {
  padding: 0 4px 10px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Countdowns */
.countdown {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 18px 16px;
}

.stat + .stat {
  box-shadow: inset 0.5px 0 0 var(--ap-separator);
}

.stat-label {
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.stat-value {
  font-size: clamp(28px, 6vw, 38px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.stat:first-child .stat-value {
  color: var(--ap-accent);
}

.stat-value small {
  margin-left: 4px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
}

.stat-note {
  color: var(--ap-label-2);
  font-size: 12px;
  line-height: 1.35;
}

.note {
  margin: -8px 4px 0;
  color: var(--ap-label-2);
  font-size: 17px;
  line-height: 1.5;
  max-width: 60ch;
  text-wrap: pretty;
}

/* Progress rows */
.progress-row {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}

.progress-row + .progress-row {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.progress-row.plain {
  gap: 2px;
}

.progress-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.row-title {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.row-value {
  color: var(--ap-label-2);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.row-detail {
  color: var(--ap-label-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--ap-fill);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--ap-accent);
  transition: width 1s var(--ap-ease);
}

/* Planner rows */
.module-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s var(--ap-ease);
}

.module-row + .module-row {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.module-row:hover {
  background: var(--ap-fill);
}

.module-row:active {
  background: var(--ap-separator);
}

.module-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
  font-size: 20px;
}

.module-text {
  display: grid;
  flex: 1;
  gap: 1px;
  min-width: 0;
}

.chevron {
  display: grid;
  color: var(--ap-label-2);
  opacity: 0.6;
  font-size: 18px;
}

@media (min-width: 900px) {
  .shell {
    padding: 24px 32px 120px;
  }

  .columns {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 40px;
    align-items: start;
  }
}

@media (max-width: 420px) {
  .shell {
    padding: 12px 16px 104px;
  }

  .stat {
    padding: 16px 12px;
  }
}
</style>

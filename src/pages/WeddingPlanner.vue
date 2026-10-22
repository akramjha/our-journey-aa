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
          <section class="group hero" aria-label="Countdowns">
            <div class="hero-main">
              <p class="hero-value">
                <template v-if="weddingCountdown.kind === 'days'">
                  <span class="sr-only">{{ weddingCountdown.value }}</span>
                  <span aria-hidden="true" class="roll">{{ heroDays }}</span>
                  <small>{{ weddingCountdown.value === 1 ? "day" : "days" }} to go</small>
                </template>
                <template v-else>{{ weddingCountdown.label }}</template>
              </p>
              <p class="hero-date">
                <template v-if="weddingDateLabel">Our wedding · {{ weddingDateLabel }}</template>
                <template v-else>Set your wedding date in settings</template>
              </p>
              <p v-if="milestone" class="hero-milestone">{{ milestone }}</p>
            </div>

            <div class="hero-side">
              <div class="stat">
                <span class="stat-value">
                  <template v-if="engagementCountdown.kind === 'days'">
                    {{ engagementCountdown.value }}<small>{{ engagementCountdown.value === 1 ? "day" : "days" }}</small>
                  </template>
                  <template v-else>{{ engagementCountdown.label }}</template>
                </span>
                <span class="stat-note">
                  {{ engagementCountdown.kind === "past" ? "Engagement" : "until engagement" }}
                </span>
              </div>

              <div class="stat">
                <span class="stat-value">
                  <template v-if="daysTogether !== null">{{ daysTogether.toLocaleString() }}<small>days</small></template>
                  <template v-else>—</template>
                </span>
                <span class="stat-note">{{ togetherLabel ? `${togetherLabel}, still counting` : "together, and still counting" }}</span>
              </div>
            </div>

            <p v-if="todayNote" class="hero-note">
              <AppIcon name="heart" />
              <span>{{ todayNote }}</span>
            </p>
          </section>

          <UpcomingTasks />

          <BudgetOverview :rows="budgetRows" :budget="budget" />
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
                  <span class="module-top">
                    <span class="row-title">{{ module.title }}</span>
                    <span class="row-value">{{ module.value }}</span>
                  </span>
                  <span
                    v-if="module.percent !== null"
                    class="bar"
                    role="progressbar"
                    :aria-valuenow="module.percent"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-label="module.title"
                  >
                    <span
                      class="bar-fill"
                      :style="{ width: (ready ? module.percent : 0) + '%' }"
                    ></span>
                  </span>
                  <span class="row-detail">{{ module.detail }}</span>
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
import BudgetOverview from "@/components/dashboard/BudgetOverview.vue";
import QuickAddModal from "@/components/dashboard/QuickAddModal.vue";
import { useDashboard } from "@/composables/useDashboard";
import { useCountUp } from "@/composables/useCountUp";
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
  completedNikahItems,
  nikahProgress,

  totalTunangItems,
  completedTunangItems,
  tunangProgress,

  budgetRows,

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
  loveNote: "Every step we take is closer to our dream",
  totalBudget: 0
});

const budget = computed(() => Math.max(0, Number(coupleSettings.value.totalBudget) || 0));

// Bars start empty and fill once the dashboard has data: the page's one entrance.
const ready = ref(false);

// Midnight of the current local day; refreshed so a tab left open stays correct.
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const today = ref(startOfDay(new Date()));

let unsubscribeSettings: (() => void) | null = null;
let clock: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  unsubscribeSettings = listenCoupleSettings((data) => {
    coupleSettings.value = {
      ...coupleSettings.value,
      ...data
    };
  });

  clock = setInterval(() => {
    const now = startOfDay(new Date());
    if (now.getTime() !== today.value.getTime()) today.value = now;
  }, 60_000);
});

onUnmounted(() => {
  if (unsubscribeSettings) unsubscribeSettings();
  if (clock) clearInterval(clock);
});

watch(
  loading,
  (isLoading) => {
    if (!isLoading) requestAnimationFrame(() => (ready.value = true));
  },
  { immediate: true }
);

// "YYYY-MM-DD" parsed as a local calendar date, not UTC midnight, so the
// day count never shifts by one west of Greenwich.
const parseLocalDate = (value: string): Date | null => {
  const [y, m, d] = String(value ?? "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const dayDiff = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / DAY_MS);

type Countdown =
  | { kind: "days"; value: number }
  | { kind: "today" | "past" | "unset"; label: string };

const countdownTo = (value: string, pastLabel: string): Countdown => {
  const date = parseLocalDate(value);
  if (!date) return { kind: "unset", label: "—" };

  const days = dayDiff(today.value, date);
  if (days > 0) return { kind: "days", value: days };
  if (days === 0) return { kind: "today", label: "Today" };
  return { kind: "past", label: pastLabel };
};

const weddingCountdown = computed(() => countdownTo(coupleSettings.value.weddingDate, "Married"));
const engagementCountdown = computed(() => countdownTo(coupleSettings.value.engagementDate, "Celebrated"));

const daysTogether = computed(() => {
  const start = parseLocalDate(coupleSettings.value.startDate);
  return start ? Math.max(0, dayDiff(start, today.value)) : null;
});

// The hero number rolls up from zero once, then follows any later change.
const heroTarget = computed(() =>
  weddingCountdown.value.kind === "days" ? weddingCountdown.value.value : null
);
const heroDays = useCountUp(heroTarget);

const MILESTONES: Record<number, string> = {
  1: "Tomorrow. Almost there, sayang.",
  7: "One week to go.",
  14: "Two weeks to go.",
  30: "One month to go. Hold hands tight.",
  50: "50 days to go. The countdown is truly on.",
  100: "100 days to go. Alhamdulillah for every step so far."
};

const milestone = computed(() => {
  const c = weddingCountdown.value;
  if (c.kind === "today") return "Today is the day. Congratulations, you two.";
  if (c.kind === "past") return "Alhamdulillah. Here's to the journey ahead.";
  return c.kind === "days" ? MILESTONES[c.value] ?? "" : "";
});

// Calendar-aware "2 years, 3 months, 12 days" since the start date.
const togetherLabel = computed(() => {
  const start = parseLocalDate(coupleSettings.value.startDate);
  if (!start || start > today.value) return "";

  let years = today.value.getFullYear() - start.getFullYear();
  let months = today.value.getMonth() - start.getMonth();
  let days = today.value.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(today.value.getFullYear(), today.value.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const unit = (n: number, word: string) => (n ? `${n} ${word}${n === 1 ? "" : "s"}` : "");
  return [unit(years, "year"), unit(months, "month"), unit(days, "day")].filter(Boolean).join(", ");
});

const weddingDateLabel = computed(() => {
  const date = parseLocalDate(coupleSettings.value.weddingDate);
  return date
    ? date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
});

const todayNote = computed(() => coupleSettings.value.loveNote);

const clamp = (value: number) =>
  Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

const itemStatus = (done: number, total: number, percent: number) =>
  total === 0
    ? { percent: null, value: "—", detail: "Nothing added yet" }
    : { percent: clamp(percent), value: `${clamp(percent)}%`, detail: `${done} of ${total} done` };

const modules = computed<{
  to: string;
  title: string;
  icon: IconName;
  percent: number | null;
  value: string;
  detail: string;
}[]>(() => [
  {
    to: "/savings",
    title: "Gold Savings",
    icon: "coins",
    percent: clamp(savingsProgress.value),
    value: `${clamp(savingsProgress.value)}%`,
    detail: `${totalGoldWeight.value.toFixed(2)}g of ${totalSavingsTarget.value}g`
  },
  {
    to: "/checklist",
    title: "Borang Checklist",
    icon: "checklist",
    ...itemStatus(completedChecklist.value, totalChecklist.value, checklistProgress.value)
  },
  {
    to: "/tunang",
    title: "Tunang Planner",
    icon: "gem",
    ...itemStatus(completedTunangItems.value, totalTunangItems.value, tunangProgress.value)
  },
  {
    to: "/nikah",
    title: "Nikah Planner",
    icon: "book",
    ...itemStatus(completedNikahItems.value, totalNikahItems.value, nikahProgress.value)
  },
  {
    to: "/wedding",
    title: "Wedding Event",
    icon: "sparkles",
    ...itemStatus(completedWeddingItems.value, totalWeddingItems.value, weddingProgress.value)
  }
]);
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

/* Hero: the wedding countdown leads, the rest supports it */
.hero {
  position: relative;
  display: grid;
  isolation: isolate;
}

/* Slow ambient glow behind the number: the only looping motion on the page. */
.hero::before {
  content: "";
  position: absolute;
  inset: -30% -10% 35% -10%;
  z-index: -1;
  background:
    radial-gradient(40% 60% at 25% 40%, var(--ap-glow-1), transparent 70%),
    radial-gradient(40% 60% at 75% 50%, var(--ap-glow-2), transparent 70%);
  filter: blur(8px);
  animation: drift 14s ease-in-out infinite alternate;
}

@keyframes drift {
  from {
    transform: translateX(-6%) scale(1);
  }
  to {
    transform: translateX(6%) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero::before {
    animation: none;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.roll {
  font-variant-numeric: tabular-nums;
}

.hero-milestone {
  margin: 12px 0 0;
  color: var(--ap-label);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.hero-main {
  padding: 24px 20px 20px;
}

.hero-value {
  margin: 0;
  color: var(--ap-accent);
  font-size: clamp(56px, 15vw, 88px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.hero-value small {
  margin-left: 10px;
  color: var(--ap-label);
  font-size: clamp(18px, 4.5vw, 24px);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.hero-date {
  margin: 10px 0 0;
  color: var(--ap-label-2);
  font-size: 15px;
}

.hero-side {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.stat {
  display: grid;
  align-content: start;
  gap: 2px;
  padding: 14px 20px;
}

.stat + .stat {
  box-shadow: inset 0.5px 0 0 var(--ap-separator);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
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
  font-size: 13px;
  line-height: 1.35;
}

.hero-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 14px 20px 16px;
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
  color: var(--ap-label);
  font-size: 16px;
  line-height: 1.45;
  text-wrap: pretty;
}

.hero-note .icon {
  margin-top: 3px;
  color: var(--ap-accent);
  font-size: 16px;
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
  display: block;
  height: 6px;
  border-radius: 999px;
  background: var(--ap-fill);
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ap-accent);
  transition: width 1s var(--ap-ease);
}

/* Planner rows carry their own progress */
.module-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
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
  gap: 6px;
  min-width: 0;
}

.module-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
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

  .hero-main {
    padding: 20px 16px 16px;
  }

  .stat,
  .hero-note {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>

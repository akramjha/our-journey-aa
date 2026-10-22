<template>
  <section aria-labelledby="journey-title">
    <div class="section-head">
      <h2 id="journey-title">Our journey</h2>
    </div>

    <div class="group card">
      <p v-if="steps.length < 2" class="empty">
        Add your dates in <RouterLink to="/settings">couple settings</RouterLink> to see your journey.
      </p>

      <template v-else>
        <ol class="steps" :style="{ '--n': steps.length }">
          <li
            v-for="(step, i) in steps"
            :key="step.key"
            class="step"
            :class="{ passed: step.passed, next: step.key === nextKey }"
            :aria-current="step.key === nextKey ? 'step' : undefined"
          >
            <span class="node" aria-hidden="true"></span>

            <span v-if="i < steps.length - 1" class="seg" aria-hidden="true">
              <span class="fill" :style="{ width: ready ? `${step.fill * 100}%` : '0%' }"></span>
              <span
                v-if="step.fill > 0 && step.fill < 1"
                class="today"
                :style="{ left: ready ? `${step.fill * 100}%` : '0%' }"
              ></span>
            </span>

            <span class="label">{{ step.label }}</span>
            <span class="date">{{ step.dateLabel }}</span>
            <span class="sr-only">{{ step.passed ? ", done" : step.key === nextKey ? ", next" : ", upcoming" }}</span>
          </li>
        </ol>

        <p v-if="summary" class="summary">{{ summary }}</p>
        <p v-if="overdue > 0" class="overdue">
          {{ overdue }} {{ overdue === 1 ? "task is" : "tasks are" }} overdue
        </p>
      </template>

      <RouterLink v-if="!hasNikah && steps.length >= 2" to="/settings" class="add-date">
        Add your nikah date
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

interface Milestone {
  key: string;
  label: string;
  date: Date | null;
}

const props = defineProps<{
  milestones: Milestone[];
  today: Date;
  /** Due dates of tasks that aren't done yet. */
  openDueDates: Date[];
}>();

const DAY_MS = 24 * 60 * 60 * 1000;

// The line fills once on load, like the other progress bars.
const ready = ref(false);
onMounted(() => requestAnimationFrame(() => (ready.value = true)));

const hasNikah = computed(() => props.milestones.some((m) => m.key === "nikah" && m.date));

const steps = computed(() => {
  const dated = props.milestones
    .filter((m): m is Milestone & { date: Date } => m.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return dated.map((m, i) => {
    const next = dated[i + 1];
    const span = next ? next.date.getTime() - m.date.getTime() : 0;
    const fill = next && span > 0
      ? Math.min(1, Math.max(0, (props.today.getTime() - m.date.getTime()) / span))
      : 0;

    return {
      key: m.key,
      label: m.label,
      date: m.date,
      dateLabel: m.date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }),
      passed: m.date.getTime() <= props.today.getTime(),
      fill
    };
  });
});

const nextStep = computed(() => steps.value.find((s) => !s.passed) ?? null);
const nextKey = computed(() => nextStep.value?.key ?? "");

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const dueBeforeNext = computed(() => {
  const next = nextStep.value;
  if (!next) return 0;
  return props.openDueDates.filter(
    (d) => d.getTime() >= props.today.getTime() && d.getTime() <= next.date.getTime()
  ).length;
});

const overdue = computed(
  () => props.openDueDates.filter((d) => d.getTime() < props.today.getTime()).length
);

const summary = computed(() => {
  const next = nextStep.value;
  if (!next) return "Every milestone is behind you. Alhamdulillah.";

  const days = Math.round((next.date.getTime() - props.today.getTime()) / DAY_MS);
  const when = days === 0 ? "today" : `in ${plural(days, "day")}`;
  const tasks = dueBeforeNext.value
    ? ` · ${plural(dueBeforeNext.value, "task")} due before then`
    : "";

  return `Next: ${next.label} ${when}${tasks}`;
});
</script>

<style scoped>
.section-head {
  padding: 0 4px 10px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.group {
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  border-radius: var(--ap-radius);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
  overflow: hidden;
}

.card {
  display: grid;
  gap: 14px;
  padding: 22px 16px 16px;
}

.empty {
  margin: 0;
  color: var(--ap-label-2);
  font-size: 15px;
}

.empty a,
.add-date {
  color: var(--ap-accent);
  text-decoration: none;
}

.steps {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 2px;
  text-align: center;
}

.node {
  position: relative;
  z-index: 1;
  width: 14px;
  height: 14px;
  margin-bottom: 8px;
  border-radius: 50%;
  background: var(--ap-bg);
  box-shadow: inset 0 0 0 2px var(--ap-separator);
}

.step.passed .node {
  background: var(--ap-accent);
  box-shadow: none;
}

.step.next .node {
  box-shadow: inset 0 0 0 2px var(--ap-accent), 0 0 0 4px var(--ap-accent-soft);
}

/* Line from this node's centre to the next one's */
.seg {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: var(--ap-separator);
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ap-accent);
  transition: width 1.2s var(--ap-ease);
}

.today {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: var(--ap-accent);
  box-shadow: 0 0 0 3px var(--ap-accent-soft);
  transition: left 1.2s var(--ap-ease);
}

.label {
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
}

.step.passed .label,
.step.next .label {
  color: var(--ap-label);
}

.step.next .label {
  font-weight: 700;
}

.date {
  color: var(--ap-label-2);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.summary {
  margin: 0;
  padding-top: 14px;
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  text-wrap: balance;
}

.overdue {
  margin: -6px 0 0;
  color: var(--ap-red);
  font-size: 14px;
}

.add-date {
  justify-self: start;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 500;
}

.add-date:focus-visible,
.empty a:focus-visible {
  outline: 2px solid var(--ap-accent);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>

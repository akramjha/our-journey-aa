<template>
  <section aria-labelledby="budget-title">
    <div class="section-head">
      <h2 id="budget-title">Budget</h2>
      <RouterLink v-if="budget <= 0" to="/settings" class="set-link">Set a budget</RouterLink>
    </div>

    <div class="group card">
      <div class="summary">
        <p class="planned">{{ money(planned) }}</p>
        <p class="planned-note">planned across tunang, nikah and wedding</p>
      </div>

      <div v-if="planned > 0 || budget > 0" class="track" role="img" :aria-label="trackLabel">
        <span class="seg settled" :style="{ width: pct(ready ? settled : 0) }"></span>
        <span
          class="seg open"
          :style="{ width: pct(ready ? planned - settled : 0), left: pct(ready ? settled : 0) }"
        ></span>
        <span v-if="budget > 0 && planned > budget" class="limit" :style="{ left: pct(budget) }"></span>
      </div>

      <ul v-if="planned > 0 || budget > 0" class="legend">
        <li><span class="dot settled"></span>{{ money(settled) }} done</li>
        <li><span class="dot open"></span>{{ money(planned - settled) }} to go</li>
      </ul>

      <p v-if="budget > 0" class="status" :class="{ over: planned > budget }">
        <template v-if="planned > budget">{{ money(planned - budget) }} over your {{ money(budget) }} budget</template>
        <template v-else>{{ money(budget - planned) }} left of your {{ money(budget) }} budget</template>
      </p>

      <p v-if="planned === 0" class="empty">Add prices in your planners and the total shows up here.</p>

      <ul v-else class="rows">
        <li v-for="row in rows" :key="row.key">
          <RouterLink :to="`/${row.key}`" class="row">
            <span class="row-title">{{ row.label }}</span>
            <span class="row-amount">{{ money(row.planned) }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
  rows: { key: string; label: string; planned: number; settled: number }[];
  budget: number;
}>();

const planned = computed(() => props.rows.reduce((t, r) => t + r.planned, 0));
const settled = computed(() => props.rows.reduce((t, r) => t + r.settled, 0));

// Bars start empty and fill once mounted, matching the planners list.
const ready = ref(false);
onMounted(() => requestAnimationFrame(() => (ready.value = true)));

const scale = computed(() => Math.max(props.budget, planned.value, 1));
const pct = (value: number) => `${Math.min(100, (value / scale.value) * 100)}%`;

const money = (value: number) => `RM ${Math.round(value).toLocaleString("en-MY")}`;

const trackLabel = computed(
  () =>
    `${money(settled.value)} done, ${money(planned.value - settled.value)} to go${
      props.budget > 0 ? `, budget ${money(props.budget)}` : ""
    }`
);
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px 10px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.set-link {
  padding: 6px 4px;
  color: var(--ap-accent);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.set-link:focus-visible,
.row:focus-visible {
  outline: 2px solid var(--ap-accent);
  outline-offset: 2px;
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
  gap: 12px;
  padding: 20px 20px 8px;
}

.planned {
  margin: 0;
  font-size: clamp(32px, 7vw, 40px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.planned-note {
  margin: 2px 0 0;
  color: var(--ap-label-2);
  font-size: 13px;
}

.track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: var(--ap-fill);
  overflow: hidden;
}

.seg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  transition: width 1s var(--ap-ease), left 1s var(--ap-ease);
}

.seg.settled {
  background: var(--ap-accent);
}

.seg.open {
  background: var(--ap-accent-soft);
  box-shadow: inset 0 0 0 1px var(--ap-accent);
}

.limit {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: var(--ap-label);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ap-label-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}

.dot.settled {
  background: var(--ap-accent);
}

.dot.open {
  box-shadow: inset 0 0 0 1.5px var(--ap-accent);
}

.status {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.status.over {
  color: var(--ap-red);
}

.empty {
  margin: 0 0 12px;
  color: var(--ap-label-2);
  font-size: 15px;
}

.rows {
  margin: 4px -20px 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 20px;
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s var(--ap-ease);
}

.row:hover {
  background: var(--ap-fill);
}

.row-title {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.row-amount {
  color: var(--ap-label-2);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
</style>

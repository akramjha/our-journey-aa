<template>
  <div class="ap-page">
    <div class="shell">
      <AppHeader />

      <button type="button" class="back" @click="$router.push('/')">
        <AppIcon name="chevron-left" />
        <span>Dashboard</span>
      </button>

      <header class="title-block">
        <h1>Couple Settings</h1>
        <p>Personalize your wedding dashboard.</p>
      </header>

      <form class="form" @submit.prevent="saveSettings">
        <section aria-labelledby="names-title">
          <h2 id="names-title" class="section-head">Names</h2>
          <div class="group">
            <div class="field">
              <label for="partner1">Partner 1 name</label>
              <input id="partner1" v-model="form.partner1" autocomplete="off" />
            </div>
            <div class="field">
              <label for="partner2">Partner 2 name</label>
              <input id="partner2" v-model="form.partner2" autocomplete="off" />
            </div>
          </div>
        </section>

        <section aria-labelledby="dates-title">
          <h2 id="dates-title" class="section-head">Dates</h2>
          <div class="group">
            <div class="field">
              <label for="startDate">Relationship start date</label>
              <input id="startDate" type="date" v-model="form.startDate" />
            </div>
            <div class="field">
              <label for="engagementDate">Engagement date</label>
              <input id="engagementDate" type="date" v-model="form.engagementDate" />
            </div>
            <div class="field">
              <label for="nikahDate">Nikah date (optional)</label>
              <input id="nikahDate" type="date" v-model="form.nikahDate" />
            </div>
            <div class="field">
              <label for="weddingDate">Wedding date</label>
              <input id="weddingDate" type="date" v-model="form.weddingDate" />
            </div>
          </div>
        </section>

        <section aria-labelledby="budget-title">
          <h2 id="budget-title" class="section-head">Budget</h2>
          <div class="group">
            <div class="field">
              <label for="totalBudget">Total wedding budget (RM)</label>
              <input
                id="totalBudget"
                type="number"
                inputmode="decimal"
                min="0"
                v-model.number="form.totalBudget"
                placeholder="Example: 40000"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="appearance-title">
          <h2 id="appearance-title" class="section-head">Appearance</h2>
          <div class="group">
            <div class="theme" role="radiogroup" aria-labelledby="theme-label">
              <span id="theme-label" class="theme-label">Theme on this device</span>
              <div class="segmented">
                <label v-for="option in themeOptions" :key="option.value">
                  <input
                    type="radio"
                    name="theme"
                    :value="option.value"
                    :checked="theme === option.value"
                    @change="setTheme(option.value)"
                  />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="note-title">
          <h2 id="note-title" class="section-head">Love note</h2>
          <div class="group">
            <div class="field">
              <label for="loveNote">Shown on your dashboard</label>
              <textarea id="loveNote" v-model="form.loveNote"></textarea>
            </div>
          </div>
        </section>

        <button type="submit" class="save-btn">Save settings</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useRouter } from "vue-router";
import { theme, setTheme } from "@/composables/useTheme";
import type { ThemeChoice } from "@/composables/useTheme";

import {
  saveCoupleSettings,
  getCoupleSettings
} from "@/services/coupleService";

const form = ref({
  partner1: "Akram",
  partner2: "Aina",

  startDate: "2024-01-01",

  engagementDate: "2026-06-01",

  weddingDate: "2026-12-31",

  nikahDate: "",

  totalBudget: 0,

  loveNote:
    "Every step we take is closer to our dream"
});

onMounted(async () => {
  const data = await getCoupleSettings();

  if (data) {
    form.value = {
      ...form.value,
      ...data
    };
  }
});

const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

const router = useRouter();

const saveSettings = async () => {
  await saveCoupleSettings(form.value);
  router.push("/");
};
</script>

<style scoped>
.theme {
  padding: 16px;
}

.theme-label {
  display: block;
  margin-bottom: 10px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  padding: 2px;
  border-radius: 12px;
  background: var(--ap-fill);
}

.segmented label {
  position: relative;
}

.segmented input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.segmented span {
  display: grid;
  place-items: center;
  min-height: 40px;
  border-radius: 10px;
  color: var(--ap-label-2);
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.2s var(--ap-ease), color 0.2s var(--ap-ease);
}

.segmented input:checked + span {
  background: var(--ap-surface);
  color: var(--ap-label);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}

.segmented input:focus-visible + span {
  outline: 2px solid var(--ap-accent);
  outline-offset: 2px;
}

.shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px 20px 112px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 44px;
  margin: 0 0 4px -6px;
  padding: 0 10px 0 4px;
  border: 0;
  background: none;
  color: var(--ap-accent);
  font: inherit;
  font-size: 17px;
  cursor: pointer;
}

.back :deep(.icon) {
  font-size: 24px;
}

.title-block {
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

.form {
  display: grid;
  gap: 28px;
}

.section-head {
  margin: 0;
  padding: 0 4px 10px;
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

.field {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}

.field + .field {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.field label {
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.field input,
.field textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--ap-surface-2);
  color: var(--ap-label);
  font-family: inherit;
  font-size: 16px;
  transition: border-color 0.2s var(--ap-ease), box-shadow 0.2s var(--ap-ease);
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--ap-accent);
  box-shadow: 0 0 0 3px var(--ap-accent-soft);
}

.field textarea {
  min-height: 120px;
  line-height: 1.5;
  resize: vertical;
}

.save-btn {
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: 12px;
  background: var(--ap-accent);
  color: #fff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s var(--ap-ease), opacity 0.2s var(--ap-ease);
}

.save-btn:hover {
  opacity: 0.92;
}

.save-btn:active {
  transform: scale(0.98);
}

@media (prefers-color-scheme: dark) {
  .save-btn {
    color: #1c1c1e;
  }
}

@media (max-width: 420px) {
  .shell {
    padding: 12px 16px 104px;
  }
}
</style>

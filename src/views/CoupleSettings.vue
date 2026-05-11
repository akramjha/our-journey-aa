<template>
  <div class="page">
    <div class="card">
        <button class="back-btn" @click="$router.push('/')">
        ← Back to Dashboard
        </button>
      <h1>💖 Couple Settings</h1>

      <p class="subtitle">
        Personalize your wedding dashboard ✨
      </p>

      <div class="form-grid">
        <div class="field">
          <label>Partner 1 Name</label>

          <input v-model="form.partner1" />
        </div>

        <div class="field">
          <label>Partner 2 Name</label>

          <input v-model="form.partner2" />
        </div>

        <div class="field">
          <label>Relationship Start Date</label>

          <input type="date" v-model="form.startDate" />
        </div>

        <div class="field">
          <label>Engagement Date</label>

          <input type="date" v-model="form.engagementDate" />
        </div>

        <div class="field">
          <label>Wedding Date</label>

          <input type="date" v-model="form.weddingDate" />
        </div>
      </div>

      <div class="field">
        <label>Custom Love Note</label>

        <textarea v-model="form.loveNote"></textarea>
      </div>

      <button class="save-btn" @click="saveSettings">
        Save Settings 💕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

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

  loveNote:
    "Every step we take is closer to our dream 💍"
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

const router = useRouter();

const saveSettings = async () => {
  await saveCoupleSettings(form.value);
  router.push("/");
};
</script>

<style scoped>
.page {
  min-height: 100vh;

  padding: 40px;

  background: linear-gradient(
    135deg,
    #fff7fb,
    #eef6ff
  );
}

.card {
  max-width: 900px;

  margin: auto;

  background: white;

  padding: 32px;

  border-radius: 28px;

  box-shadow: 0 10px 28px rgba(0,0,0,0.05);
}

h1 {
  margin-top: 0;

  color: #d63384;
}

.subtitle {
  color: #777;

  margin-bottom: 28px;
}

.form-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 18px;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;

  margin-bottom: 8px;

  font-size: 13px;

  color: #555;

  font-weight: 700;
}

.field input,
.field textarea {
  width: 100%;

  padding: 14px;

  border-radius: 14px;

  border: 1px solid #eee;

  box-sizing: border-box;

  font-size: 14px;
}

.field textarea {
  min-height: 120px;

  resize: vertical;
}

.save-btn {
  width: 100%;

  border: none;

  padding: 16px;

  border-radius: 16px;

  background: linear-gradient(
    135deg,
    #ff9a9e,
    #a0c4ff
  );

  color: white;

  font-weight: 800;

  cursor: pointer;
}

.back-btn {
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  background: #fff0f5;
  color: #d63384;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 18px;
}

@media (max-width: 768px) {
  .page {
    padding: 18px;
  }

  .card {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
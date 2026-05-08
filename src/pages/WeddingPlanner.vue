<template>
  <div class="page">
    <AppHeader />

    <header class="header">
      <h1>💍 Our Wedding Journey</h1>
      <p>Planning forever, together ✨</p>
    </header>

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
    </div>

    <div class="module-grid">
      <div class="module-card">
        <h2>💰 Gold Savings</h2>
        <p>Track our wedding gold contributions</p>

        <button @click="$router.push('/savings')">
          Open Module →
        </button>
      </div>

      <div class="module-card">
        <h2>💍 Tunang Planner</h2>
        <p>Plan venue, attire, hantaran, food, decor and services</p>

        <button @click="$router.push('/tunang')">
          Open Module →
        </button>
      </div>

      <div class="module-card">
        <h2>📑 Borang Checklist</h2>
        <p>Track nikah documents, forms and submissions</p>

        <button @click="$router.push('/checklist')">
          Open Module →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";

const startDate = new Date("2024-10-02");

const engagementDate = new Date("2027-10-02"); // change this
const weddingDate = new Date("2028-12-02"); // change this

const daysTogether = Math.floor(
  (new Date().getTime() - startDate.getTime()) /
    (1000 * 60 * 60 * 24)
);

const engagementDaysLeft = Math.floor(
  (engagementDate.getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
);

const daysLeft = Math.floor(
  (weddingDate.getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
);

const loveNotes = [
  "I can’t wait to build forever with you 💖",
  "Every step we take is closer to our dream 💍",
  "You are my safest place ❤️",
  "Our future looks beautiful together ✨"
];

const todayNote = loveNotes[new Date().getDate() % loveNotes.length];
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

.header h1 {
  font-size: 42px;
  margin-bottom: 10px;
}

.header p {
  font-size: 18px;
  color: #777;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 36px;
}

.card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.romantic {
  background: linear-gradient(135deg, #fff0f5, #fffaf0);
  border: 1px solid rgba(255, 182, 193, 0.4);
}

.big {
  font-size: 26px;
  font-weight: 800;
}

.small {
  font-size: 13px;
  color: #777;
}

.note {
  font-style: italic;
  color: #d63384;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.module-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.module-card h2 {
  color: #d63384;
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
}

@media (max-width: 768px) {
  .page {
    padding: 18px;
  }

  .header {
    margin-bottom: 24px;
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

  .big {
    font-size: 24px;
  }

  .module-card button {
    width: 100%;
    padding: 12px;
  }
}
</style>
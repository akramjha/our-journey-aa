<template>
  <div>
    <header class="main-header">
      <h1>💰 Gold Savings</h1>
      <p>Tracking our future together ✨</p>
    </header>

    <div class="goal-card">
      <div class="goal-top">
        <div>
          <h2>🎯 Gold Goal</h2>
          <p>48g each • 96g together</p>
        </div>

        <div class="goal-mini">
          {{ totalWeight.toFixed(4) }}g / 96g
        </div>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${Math.min((totalWeight / 96) * 100, 100)}%` }"
        ></div>
      </div>
    </div>

    <div class="overall">
      <div class="overall-box">
        <span>Total Savings Together</span>
        <h2>RM {{ totalSpend.toFixed(2) }}</h2>
      </div>

      <div class="overall-box">
        <span>Total Gold Together</span>
        <h2>{{ totalWeight.toFixed(4) }}g</h2>
      </div>

      <div class="overall-box">
        <span>Remaining Goal</span>
        <h2>{{ Math.max(96 - totalWeight, 0).toFixed(4) }}g</h2>
      </div>

      <div class="overall-box">
        <span>Live Gold Price</span>
        <h2>RM {{ liveGoldPrice }}/g</h2>
      </div>
    </div>

    <div class="investment-card">
      <h2>📈 Current Gold Value Today</h2>

      <div class="investment-grid">
        <div class="invest-box">
          <span>Total Gold Owned</span>
          <h3>{{ totalWeight.toFixed(4) }}g</h3>
        </div>

        <div class="invest-box">
          <span>Current Gold Price</span>
          <h3>RM {{ liveGoldPrice }}/g</h3>
        </div>

        <div class="invest-box">
          <span>Current Gold Value</span>
          <h3>RM {{ currentGoldValue.toFixed(2) }}</h3>
        </div>

        <div class="invest-box">
          <span>Total Invested</span>
          <h3>RM {{ totalSpend.toFixed(2) }}</h3>
        </div>

        <div class="invest-box profit">
          <span>Growth / Profit</span>
          <h3>RM {{ (currentGoldValue - totalSpend).toFixed(2) }}</h3>
        </div>
      </div>
    </div>

    <div class="profile-grid">
      <div class="profile-card aina">
        <div class="profile-header">
          <div>
            <h2>🌸 Aina</h2>
            <p>Wedding Gold Savings</p>
          </div>

          <div class="mini-total">
            {{ ainaWeight.toFixed(4) }}g
          </div>
        </div>

        <div class="form">
          <div class="field">
            <label>Current Gold Price / g</label>
            <input
              type="number"
              v-model.number="ainaForm.currentGoldPricePerGram"
              placeholder="Example: 631"
            />
          </div>

          <div class="field">
            <label>Purchase Price (RM)</label>
            <input
              type="number"
              v-model.number="ainaForm.purchasePrice"
              placeholder="Example: 100"
            />
          </div>

          <button class="save-btn" @click="addAina">
            + Add Savings
          </button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRICE/g</th>
                <th>PURCHASE</th>
                <th>WEIGHT(g)</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in ainaItems" :key="item.id">
                <td>{{ item.currentGoldPricePerGram }}</td>
                <td>RM {{ item.purchasePrice }}</td>
                <td>{{ (item.purchasePrice / item.currentGoldPricePerGram).toFixed(4) }}</td>
                <td>
                  <button class="delete-btn" @click="remove(item.id!)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="summary-card">
          <div class="summary-box">
            <span>Total Savings</span>
            <h3>RM {{ ainaSpend.toFixed(2) }}</h3>
          </div>

          <div class="summary-box">
            <span>Total Gold</span>
            <h3>{{ ainaWeight.toFixed(4) }}g</h3>
          </div>
        </div>
      </div>

      <div class="profile-card akram">
        <div class="profile-header">
          <div>
            <h2>💙 Akram</h2>
            <p>Wedding Gold Savings</p>
          </div>

          <div class="mini-total">
            {{ akramWeight.toFixed(4) }}g
          </div>
        </div>

        <div class="form">
          <div class="field">
            <label>Current Gold Price / g</label>
            <input
              type="number"
              v-model.number="akramForm.currentGoldPricePerGram"
              placeholder="Example: 631"
            />
          </div>

          <div class="field">
            <label>Purchase Price (RM)</label>
            <input
              type="number"
              v-model.number="akramForm.purchasePrice"
              placeholder="Example: 100"
            />
          </div>

          <button class="save-btn" @click="addAkram">
            + Add Savings
          </button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRICE/g</th>
                <th>PURCHASE</th>
                <th>WEIGHT(g)</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in akramItems" :key="item.id">
                <td>{{ item.currentGoldPricePerGram }}</td>
                <td>RM {{ item.purchasePrice }}</td>
                <td>{{ (item.purchasePrice / item.currentGoldPricePerGram).toFixed(4) }}</td>
                <td>
                  <button class="delete-btn" @click="remove(item.id!)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="summary-card">
          <div class="summary-box">
            <span>Total Savings</span>
            <h3>RM {{ akramSpend.toFixed(2) }}</h3>
          </div>

          <div class="summary-box">
            <span>Total Gold</span>
            <h3>{{ akramWeight.toFixed(4) }}g</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import {
  listenContributions,
  addContribution,
  deleteContribution
} from "@/services/savingsService";

import { getGoldPriceMYR } from "@/services/goldService";

type Contribution = {
  id?: string;
  user: string;
  currentGoldPricePerGram: number;
  purchasePrice: number;
};

const liveGoldPrice = ref(647);
const data = ref<Contribution[]>([]);

const ainaForm = ref({
  user: "Aina",
  currentGoldPricePerGram: undefined as number | undefined,
  purchasePrice: undefined as number | undefined
});

const akramForm = ref({
  user: "Akram",
  currentGoldPricePerGram: undefined as number | undefined,
  purchasePrice: undefined as number | undefined
});

onMounted(() => {
  listenContributions((items) => {
    data.value = items;
  });

  refreshPrice();
  setInterval(refreshPrice, 10000);
});

const refreshPrice = async () => {
  liveGoldPrice.value = await getGoldPriceMYR("public");
};

const addAina = async () => {
  if (ainaForm.value.currentGoldPricePerGram && ainaForm.value.purchasePrice) {
    await addContribution(ainaForm.value);
    ainaForm.value.currentGoldPricePerGram = undefined;
    ainaForm.value.purchasePrice = undefined;
  }
};

const addAkram = async () => {
  if (akramForm.value.currentGoldPricePerGram && akramForm.value.purchasePrice) {
    await addContribution(akramForm.value);
    akramForm.value.currentGoldPricePerGram = undefined;
    akramForm.value.purchasePrice = undefined;
  }
};

const remove = async (id: string) => {
  await deleteContribution(id);
};

const ainaItems = computed(() =>
  data.value.filter((i) => i.user === "Aina")
);

const akramItems = computed(() =>
  data.value.filter((i) => i.user === "Akram")
);

const calculateWeight = (item: Contribution) => {
  if (!item.currentGoldPricePerGram) return 0;
  return item.purchasePrice / item.currentGoldPricePerGram;
};

const ainaWeight = computed(() =>
  ainaItems.value.reduce((a, b) => a + calculateWeight(b), 0)
);

const akramWeight = computed(() =>
  akramItems.value.reduce((a, b) => a + calculateWeight(b), 0)
);

const ainaSpend = computed(() =>
  ainaItems.value.reduce((a, b) => a + Number(b.purchasePrice), 0)
);

const akramSpend = computed(() =>
  akramItems.value.reduce((a, b) => a + Number(b.purchasePrice), 0)
);

const totalWeight = computed(() =>
  ainaWeight.value + akramWeight.value
);

const totalSpend = computed(() =>
  ainaSpend.value + akramSpend.value
);

const currentGoldValue = computed(() =>
  totalWeight.value * liveGoldPrice.value
);
</script>

<style scoped>
.main-header {
  text-align: center;
  margin-bottom: 40px;
}

.main-header h1 {
  font-size: 42px;
  margin-bottom: 10px;
}

.main-header p {
  color: #777;
  font-size: 18px;
}

.goal-card,
.investment-card {
  background: white;
  padding: 28px;
  border-radius: 28px;
  margin-bottom: 28px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.05);
}

.goal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-top p {
  color: #777;
}

.goal-mini {
  background: #f5f5f5;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
}

.progress-bar {
  height: 16px;
  background: #eee;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 18px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
}

.overall {
  margin-bottom: 28px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.overall-box {
  background: white;
  padding: 24px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 10px 24px rgba(0,0,0,0.05);
}

.overall-box span,
.invest-box span,
.summary-box span {
  color: #777;
  font-size: 13px;
}

.investment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 18px;
}

.invest-box {
  background: #f8f8f8;
  padding: 22px;
  border-radius: 18px;
}

.invest-box h3 {
  margin: 0;
  font-size: 24px;
}

.profit {
  background: linear-gradient(135deg, #d4ffe3, #f1fff5);
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 26px;
}

.profile-card {
  padding: 26px;
  border-radius: 28px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.05);
}

.aina {
  background: #fff0f5;
}

.akram {
  background: #eef6ff;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-header p {
  color: #777;
}

.mini-total {
  background: white;
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 800;
}

.form {
  margin-top: 24px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
}

.field input {
  width: 100%;
  padding: 13px;
  border-radius: 14px;
  border: none;
  background: white;
  box-sizing: border-box;
  font-size: 14px;
}

.save-btn {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.table-wrapper {
  margin-top: 26px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255,255,255,0.75);
}

th {
  background: #ffe082;
  padding: 14px;
  font-size: 13px;
}

td {
  padding: 14px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.delete-btn {
  border: none;
  background: #ffe3e3;
  color: #d33;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.summary-card {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-box {
  background: white;
  padding: 18px;
  border-radius: 18px;
  text-align: center;
}

@media (max-width: 768px) {
  .main-header {
    margin-bottom: 26px;
  }

  .main-header h1 {
    font-size: 32px;
  }

  .main-header p {
    font-size: 15px;
  }

  .goal-card,
  .investment-card,
  .profile-card,
  .overall-box {
    padding: 20px;
    border-radius: 22px;
  }

  .overall,
  .profile-grid,
  .investment-grid,
  .summary-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .goal-top,
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .goal-mini,
  .mini-total {
    width: fit-content;
  }

  table {
    min-width: 520px;
  }

  th,
  td {
    padding: 12px;
    font-size: 13px;
    white-space: nowrap;
  }

  .field input {
    padding: 14px;
    font-size: 16px;
  }

  .save-btn {
    padding: 14px;
    font-size: 15px;
  }

  .delete-btn {
    padding: 8px 11px;
  }
}
</style>
<template>
  <div class="gold">
    <header class="page-head">
      <h1>Gold savings</h1>
      <p class="lede">Tracking our future together.</p>
    </header>

    <section class="panel" aria-labelledby="goal-title">
      <div class="panel-head">
        <div>
          <h2 id="goal-title">Gold goal</h2>
          <p class="sub">48g each, 96g together</p>
        </div>
        <span class="chip num">{{ totalWeight.toFixed(4) }}g / 96g</span>
      </div>

      <div
        class="progress"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="96"
        :aria-valuenow="Math.min(totalWeight, 96)"
        aria-label="Gold saved toward goal"
      >
        <div
          class="progress-fill"
          :style="{ width: `${Math.min((totalWeight / 96) * 100, 100)}%` }"
        ></div>
      </div>

      <ul class="list">
        <li class="row">
          <span>Total savings together</span>
          <strong class="num">RM {{ money(totalSpend) }}</strong>
        </li>
        <li class="row">
          <span>Total gold together</span>
          <strong class="num">{{ totalWeight.toFixed(4) }}g</strong>
        </li>
        <li class="row">
          <span>Remaining goal</span>
          <strong class="num">{{ Math.max(96 - totalWeight, 0).toFixed(4) }}g</strong>
        </li>
      </ul>
    </section>

    <section class="panel" aria-labelledby="value-title">
      <div class="panel-head">
        <div>
          <h2 id="value-title">Gold value today</h2>
          <p class="sub">Based on the live gold price</p>
        </div>
        <span class="icon-tile"><AppIcon name="coins" /></span>
      </div>

      <ul class="list">
        <li class="row">
          <span>Live gold price</span>
          <strong class="num">RM {{ liveGoldPrice }}/g</strong>
        </li>
        <li class="row">
          <span>Total gold owned</span>
          <strong class="num">{{ totalWeight.toFixed(4) }}g</strong>
        </li>
        <li class="row">
          <span>Current gold value</span>
          <strong class="num">RM {{ money(currentGoldValue) }}</strong>
        </li>
        <li class="row">
          <span>Total invested</span>
          <strong class="num">RM {{ money(totalSpend) }}</strong>
        </li>
        <li class="row">
          <span>Growth / profit</span>
          <strong class="num accent">RM {{ money(currentGoldValue - totalSpend) }}</strong>
        </li>
      </ul>
    </section>

    <div class="people">
      <section class="panel" aria-labelledby="aina-title">
        <div class="panel-head">
          <div>
            <h2 id="aina-title">Aina</h2>
            <p class="sub">Wedding gold savings</p>
          </div>
          <span class="chip num">{{ ainaWeight.toFixed(4) }}g</span>
        </div>

        <form class="form" @submit.prevent="addAina">
          <div class="field">
            <label for="aina-price">Current gold price per gram (RM)</label>
            <input
              id="aina-price"
              type="number"
              inputmode="decimal"
              v-model.number="ainaForm.currentGoldPricePerGram"
              placeholder="Example: 631"
            />
          </div>

          <div class="field">
            <label for="aina-buy">Purchase price (RM)</label>
            <input
              id="aina-buy"
              type="number"
              inputmode="decimal"
              v-model.number="ainaForm.purchasePrice"
              placeholder="Example: 100"
            />
          </div>

          <button type="submit" class="primary">
            <AppIcon name="plus" />
            <span>Add savings</span>
          </button>
        </form>

        <ul class="list entries" v-if="ainaItems.length">
          <li v-for="item in ainaItems" :key="item.id" class="entry">
            <div class="entry-main">
              <span class="entry-title num">RM {{ item.purchasePrice }}</span>
              <span class="sub num">at RM {{ item.currentGoldPricePerGram }}/g</span>
            </div>
            <span class="entry-weight num">{{ (item.purchasePrice / item.currentGoldPricePerGram).toFixed(4) }}g</span>
            <button
              type="button"
              class="icon-btn"
              :aria-label="`Remove RM ${item.purchasePrice} entry`"
              @click="remove(item.id!)"
            >
              <AppIcon name="x" />
            </button>
          </li>
        </ul>
        <p v-else class="empty">No savings added yet. Your first entry will show up here.</p>

        <ul class="list totals">
          <li class="row">
            <span>Total savings</span>
            <strong class="num">RM {{ money(ainaSpend) }}</strong>
          </li>
          <li class="row">
            <span>Total gold</span>
            <strong class="num">{{ ainaWeight.toFixed(4) }}g</strong>
          </li>
        </ul>
      </section>

      <section class="panel" aria-labelledby="akram-title">
        <div class="panel-head">
          <div>
            <h2 id="akram-title">Akram</h2>
            <p class="sub">Wedding gold savings</p>
          </div>
          <span class="chip num">{{ akramWeight.toFixed(4) }}g</span>
        </div>

        <form class="form" @submit.prevent="addAkram">
          <div class="field">
            <label for="akram-price">Current gold price per gram (RM)</label>
            <input
              id="akram-price"
              type="number"
              inputmode="decimal"
              v-model.number="akramForm.currentGoldPricePerGram"
              placeholder="Example: 631"
            />
          </div>

          <div class="field">
            <label for="akram-buy">Purchase price (RM)</label>
            <input
              id="akram-buy"
              type="number"
              inputmode="decimal"
              v-model.number="akramForm.purchasePrice"
              placeholder="Example: 100"
            />
          </div>

          <button type="submit" class="primary">
            <AppIcon name="plus" />
            <span>Add savings</span>
          </button>
        </form>

        <ul class="list entries" v-if="akramItems.length">
          <li v-for="item in akramItems" :key="item.id" class="entry">
            <div class="entry-main">
              <span class="entry-title num">RM {{ item.purchasePrice }}</span>
              <span class="sub num">at RM {{ item.currentGoldPricePerGram }}/g</span>
            </div>
            <span class="entry-weight num">{{ (item.purchasePrice / item.currentGoldPricePerGram).toFixed(4) }}g</span>
            <button
              type="button"
              class="icon-btn"
              :aria-label="`Remove RM ${item.purchasePrice} entry`"
              @click="remove(item.id!)"
            >
              <AppIcon name="x" />
            </button>
          </li>
        </ul>
        <p v-else class="empty">No savings added yet. Your first entry will show up here.</p>

        <ul class="list totals">
          <li class="row">
            <span>Total savings</span>
            <strong class="num">RM {{ money(akramSpend) }}</strong>
          </li>
          <li class="row">
            <span>Total gold</span>
            <strong class="num">{{ akramWeight.toFixed(4) }}g</strong>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const money = (value: number) =>
  Number(value || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

import { ref, computed, onMounted } from "vue";

import AppIcon from "@/components/ui/AppIcon.vue";

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
.gold {
  display: grid;
  gap: 20px;
}

.page-head {
  padding: 8px 4px 4px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 6vw, 48px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.lede {
  margin: 8px 0 0;
  color: var(--ap-label-2);
  font-size: 16px;
}

.panel {
  min-width: 0;
  padding: 20px;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  border-radius: var(--ap-radius);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.sub {
  margin: 2px 0 0;
  color: var(--ap-label-2);
  font-size: 13px;
}

.num {
  font-variant-numeric: tabular-nums;
}

.chip {
  flex: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
  font-size: 13px;
  font-weight: 600;
}

.icon-tile {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
  font-size: 20px;
}

.progress {
  height: 10px;
  margin-bottom: 16px;
  background: var(--ap-fill);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  min-width: 4px;
  background: var(--ap-accent);
  border-radius: 999px;
  transition: width 0.6s var(--ap-ease);
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.row,
.entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  font-size: 16px;
}

.row + .row,
.entry + .entry {
  border-top: 0.5px solid var(--ap-separator);
}

.row span {
  color: var(--ap-label-2);
}

.row strong {
  font-weight: 600;
  text-align: right;
}

.row strong.accent {
  color: var(--ap-accent);
}

.people {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
}

.form {
  display: grid;
  gap: 14px;
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin: 0 0 6px 4px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.field input {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 0;
  border-radius: 12px;
  background: var(--ap-surface-2);
  color: var(--ap-label);
  font-family: inherit;
  font-size: 16px;
  transition: box-shadow 0.2s var(--ap-ease);
}

.field input::placeholder {
  color: var(--ap-label-2);
  opacity: 0.8;
}

.field input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--ap-accent);
}

.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  border-radius: 12px;
  background: var(--ap-accent);
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s var(--ap-ease), opacity 0.2s var(--ap-ease);
}

.primary:hover {
  opacity: 0.92;
}

.primary:active {
  transform: scale(0.98);
}

.entries {
  margin-bottom: 8px;
}

.entry {
  min-height: 56px;
}

.entry-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.entry-title {
  font-size: 16px;
  font-weight: 600;
}

.entry-weight {
  color: var(--ap-label-2);
  font-size: 16px;
}

.icon-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ap-label-2);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s var(--ap-ease), color 0.2s var(--ap-ease);
}

.icon-btn:hover {
  background: var(--ap-fill);
  color: var(--ap-red);
}

.empty {
  margin: 0 0 8px;
  padding: 12px 0;
  color: var(--ap-label-2);
  font-size: 13px;
}

.totals {
  padding-top: 4px;
  border-top: 0.5px solid var(--ap-separator);
}

@media (min-width: 760px) {
  .people {
    grid-template-columns: 1fr 1fr;
  }

  .panel {
    padding: 24px;
  }
}
</style>

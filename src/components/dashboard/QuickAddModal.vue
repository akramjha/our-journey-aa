<template>
  <button class="fab" @click="openModal">
    <AppIcon name="plus" />
    <span>Quick add</span>
  </button>

  <div v-if="showModal" class="overlay" @click.self="closeModal">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="qa-title">
      <div class="sheet-header">
        <div>
          <h2 id="qa-title">Quick add</h2>
          <p>Add anything without leaving the dashboard.</p>
        </div>

        <button class="close-btn" aria-label="Close" @click="closeModal">
          <AppIcon name="x" />
        </button>
      </div>

      <div class="field">
        <label for="qa-module">Module</label>
        <select id="qa-module" v-model="selectedModule">
          <option value="checklist">Checklist</option>
          <option value="tunang">Tunang</option>
          <option value="nikah">Nikah</option>
          <option value="wedding">Wedding event</option>
          <option value="savings">Gold savings</option>
        </select>
      </div>

      <!-- CHECKLIST -->
      <div v-if="selectedModule === 'checklist'">
        <div class="field">
          <label for="qa-item">Item</label>
          <input id="qa-item" v-model="checklistForm.item" placeholder="Example: HIV Test" />
        </div>

        <div class="field">
          <label for="qa-ccat">Category</label>
          <select id="qa-ccat" v-model="checklistForm.category">
            <option value="items">Items</option>
            <option value="borang_aina">Borang Aina</option>
            <option value="borang_akram">Borang Akram</option>
          </select>
        </div>

        <div class="field">
          <label for="qa-notes">Notes</label>
          <textarea id="qa-notes" v-model="checklistForm.notes" placeholder="Any notes"></textarea>
        </div>
      </div>

      <!-- TUNANG / NIKAH / WEDDING -->
      <div v-if="selectedModule === 'tunang' || selectedModule === 'nikah' || selectedModule === 'wedding'">
        <div class="field">
          <label for="qa-name">Item name</label>
          <input id="qa-name" v-model="plannerForm.name" placeholder="Example: Venue, baju, MUA" />
        </div>

        <div class="field">
          <label for="qa-pcat">Category</label>
          <select id="qa-pcat" v-model="plannerForm.category">
            <option
              v-for="cat in activeCategories"
              :key="cat.key"
              :value="cat.key"
            >
              {{ cat.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="qa-price">Price (RM)</label>
          <input id="qa-price" type="number" inputmode="decimal" v-model.number="plannerForm.price" />
        </div>

        <div class="field">
          <label for="qa-vendor">Vendor</label>
          <input id="qa-vendor" v-model="plannerForm.vendor" placeholder="Optional" />
        </div>

        <div class="field">
          <label for="qa-details">Details</label>
          <textarea id="qa-details" v-model="plannerForm.details" placeholder="Any details"></textarea>
        </div>
      </div>

      <!-- SAVINGS -->
      <div v-if="selectedModule === 'savings'">
        <div class="field">
          <label for="qa-person">Person</label>
          <select id="qa-person" v-model="savingsForm.user">
            <option value="Aina">Aina</option>
            <option value="Akram">Akram</option>
          </select>
        </div>

        <div class="field">
          <label for="qa-gold">Gold price per gram (RM)</label>
          <input
            id="qa-gold"
            type="number"
            inputmode="decimal"
            v-model.number="savingsForm.currentGoldPricePerGram"
            placeholder="Example: 647"
          />
        </div>

        <div class="field">
          <label for="qa-purchase">Purchase price (RM)</label>
          <input
            id="qa-purchase"
            type="number"
            inputmode="decimal"
            v-model.number="savingsForm.purchasePrice"
            placeholder="Example: 100"
          />
        </div>
      </div>

      <button class="save-btn" @click="submitQuickAdd">
        Save to {{ moduleLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

import AppIcon from "@/components/ui/AppIcon.vue";
import { addChecklistItem } from "@/services/checklistService";
import { addTunangItem } from "@/services/tunangService";
import { addNikahItem } from "@/services/nikahService";
import { addWeddingItem } from "@/services/weddingService";
import { addContribution } from "@/services/savingsService";

const showModal = ref(false);
const selectedModule = ref("checklist");

const checklistForm = ref({
  category: "items",
  item: "",
  progress: "NOT YET",
  notes: "",
  files: [],
  completed: false
});

const plannerForm = ref({
  category: "venue",
  name: "",
  price: 0,
  quantity: undefined as number | undefined,
  vendor: "",
  details: "",
  progress: "NOT YET",
  priority: "LOW",
  wishlistLink: "",
  files: [],
  completed: false
});

const savingsForm = ref({
  user: "Aina",
  currentGoldPricePerGram: undefined as number | undefined,
  purchasePrice: undefined as number | undefined
});

const tunangCategories = [
  { key: "venue", label: "Venue Suggestion", icon: "🏛️" },
  { key: "attire", label: "Attire", icon: "👗" },
  { key: "hantaran_aina", label: "Hantaran Aina", icon: "🎁" },
  { key: "hantaran_akram", label: "Hantaran Akram", icon: "🎁" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "decor", label: "Decor", icon: "🌸" },
  { key: "extra_services", label: "Extra Services", icon: "📸" }
];

const nikahCategories = [
  { key: "attire", label: "Attire", icon: "👗" },
  { key: "hantaran_aina", label: "Hantaran Aina", icon: "🎁" },
  { key: "hantaran_akram", label: "Hantaran Akram", icon: "🎁" },
  { key: "dulang_mas_kahwin", label: "Dulang Mas Kahwin", icon: "💍" },
  { key: "decor", label: "Decor", icon: "🌸" },
  { key: "extra_services", label: "Extra Services", icon: "📸" }
];

const weddingCategories = [
  { key: "venue", label: "Venue Suggestion", icon: "🏛️" },
  { key: "attire", label: "Attire", icon: "👗" },
  { key: "extra_booth", label: "Extra Booth", icon: "🍰" },
  { key: "decor", label: "Decor", icon: "🌸" },
  { key: "extra_services", label: "Extra Services", icon: "📸" },
  { key: "doorgift", label: "Doorgift", icon: "🎁" }
];

const activeCategories = computed(() => {
  if (selectedModule.value === "nikah") return nikahCategories;
  if (selectedModule.value === "wedding") return weddingCategories;
  return tunangCategories;
});

const moduleLabel = computed(() => {
  if (selectedModule.value === "checklist") return "Checklist";
  if (selectedModule.value === "tunang") return "Tunang";
  if (selectedModule.value === "nikah") return "Nikah";
  if (selectedModule.value === "wedding") return "Wedding";
  return "Gold Savings";
});

watch(selectedModule, () => {
  plannerForm.value.category = activeCategories.value[0]?.key || "venue";
});

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showModal.value) closeModal();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const resetForms = () => {
  checklistForm.value = {
    category: "items",
    item: "",
    progress: "NOT YET",
    notes: "",
    files: [],
    completed: false
  };

  plannerForm.value = {
    category: activeCategories.value[0]?.key || "venue",
    name: "",
    price: 0,
    quantity: undefined,
    vendor: "",
    details: "",
    progress: "NOT YET",
    priority: "LOW",
    wishlistLink: "",
    files: [],
    completed: false
  };

  savingsForm.value = {
    user: "Aina",
    currentGoldPricePerGram: undefined,
    purchasePrice: undefined
  };
};

const submitQuickAdd = async () => {
  if (selectedModule.value === "checklist") {
    if (!checklistForm.value.item.trim()) return;
    await addChecklistItem(checklistForm.value);
  }

  if (selectedModule.value === "tunang") {
    if (!plannerForm.value.name.trim()) return;
    await addTunangItem(plannerForm.value);
  }

  if (selectedModule.value === "nikah") {
    if (!plannerForm.value.name.trim()) return;
    await addNikahItem(plannerForm.value);
  }

  if (selectedModule.value === "wedding") {
    if (!plannerForm.value.name.trim()) return;
    await addWeddingItem(plannerForm.value);
  }

  if (selectedModule.value === "savings") {
    if (
      !savingsForm.value.currentGoldPricePerGram ||
      !savingsForm.value.purchasePrice
    ) {
      return;
    }

    await addContribution(savingsForm.value);
  }

  resetForms();
  closeModal();
};
</script>

<style scoped>
.fab {
  position: fixed;
  right: 20px;
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--ap-accent);
  color: #fff;
  font-family: var(--ap-font);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.35), 0 6px 20px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s var(--ap-ease), box-shadow 0.2s var(--ap-ease);
}

.fab :deep(.icon) {
  font-size: 20px;
}

.fab:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
}

.fab:active {
  transform: scale(0.97);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  animation: dim 0.3s var(--ap-ease);
}

.sheet {
  width: min(480px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px 20px 20px;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  color: var(--ap-label);
  border-radius: 20px;
  box-shadow: var(--ap-glass-edge), 0 24px 60px rgba(0, 0, 0, 0.28);
  font-family: var(--ap-font);
  animation: rise 0.4s var(--ap-ease);
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.sheet-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.sheet-header p {
  margin: 4px 0 0;
  color: var(--ap-label-2);
  font-size: 14px;
}

.close-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--ap-fill);
  color: var(--ap-label-2);
  font-size: 16px;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--ap-separator);
}

.field {
  margin-bottom: 14px;
}

.field label {
  display: block;
  margin: 0 0 6px 4px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.field input,
.field select,
.field textarea {
  width: 100%;
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

.field input::placeholder,
.field textarea::placeholder {
  color: var(--ap-label-2);
  opacity: 0.8;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--ap-accent);
}

.field textarea {
  min-height: 88px;
  resize: vertical;
}

.save-btn {
  width: 100%;
  margin-top: 6px;
  padding: 14px;
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

.save-btn:hover {
  opacity: 0.92;
}

.save-btn:active {
  transform: scale(0.98);
}

@keyframes dim {
  from {
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
}

@keyframes slide {
  from {
    transform: translateY(100%);
  }
}

@media (max-width: 600px) {
  .overlay {
    align-items: end;
    padding: 0;
  }

  .sheet {
    width: 100%;
    max-height: 92vh;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    border-radius: 20px 20px 0 0;
    animation-name: slide;
  }
}
</style>

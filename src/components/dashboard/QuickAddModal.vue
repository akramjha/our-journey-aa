<template>
  <button ref="fabEl" class="fab" @click="openModal">
    <AppIcon name="plus" />
    <span>Quick add</span>
  </button>

  <div v-if="showModal" class="overlay" @click.self="closeModal">
    <div ref="sheetEl" class="sheet" role="dialog" aria-modal="true" aria-labelledby="qa-title">
      <div class="sheet-header">
        <div>
          <h2 id="qa-title">Quick add</h2>
          <p>Add anything without leaving the dashboard.</p>
        </div>

        <button class="close-btn" aria-label="Close" @click="closeModal">
          <AppIcon name="x" />
        </button>
      </div>

      <form novalidate @submit.prevent="submitQuickAdd">
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

      <p v-if="error" class="form-error" role="alert">{{ error }}</p>

      <button type="submit" class="save-btn" :disabled="saving">
        {{ saving ? "Saving…" : `Save to ${moduleLabel}` }}
      </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

import AppIcon from "@/components/ui/AppIcon.vue";
import { addChecklistItem } from "@/services/checklistService";
import { addTunangItem } from "@/services/tunangService";
import { addNikahItem } from "@/services/nikahService";
import { addWeddingItem } from "@/services/weddingService";
import { addContribution } from "@/services/savingsService";

const showModal = ref(false);
const selectedModule = ref("checklist");
const saving = ref(false);
const error = ref("");
const fabEl = ref<HTMLButtonElement | null>(null);
const sheetEl = ref<HTMLElement | null>(null);

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
  { key: "venue", label: "Venue Suggestion" },
  { key: "attire", label: "Attire" },
  { key: "hantaran_aina", label: "Hantaran Aina" },
  { key: "hantaran_akram", label: "Hantaran Akram" },
  { key: "food", label: "Food" },
  { key: "decor", label: "Decor" },
  { key: "extra_services", label: "Extra Services" }
];

const nikahCategories = [
  { key: "attire", label: "Attire" },
  { key: "hantaran_aina", label: "Hantaran Aina" },
  { key: "hantaran_akram", label: "Hantaran Akram" },
  { key: "dulang_mas_kahwin", label: "Dulang Mas Kahwin" },
  { key: "decor", label: "Decor" },
  { key: "extra_services", label: "Extra Services" }
];

const weddingCategories = [
  { key: "venue", label: "Venue Suggestion" },
  { key: "attire", label: "Attire" },
  { key: "extra_booth", label: "Extra Booth" },
  { key: "decor", label: "Decor" },
  { key: "extra_services", label: "Extra Services" },
  { key: "doorgift", label: "Doorgift" }
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

const openModal = async () => {
  error.value = "";
  showModal.value = true;
  document.body.style.overflow = "hidden";
  await nextTick();
  sheetEl.value?.querySelector<HTMLElement>("select, input, textarea")?.focus();
};

const closeModal = () => {
  showModal.value = false;
  document.body.style.overflow = "";
  fabEl.value?.focus();
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showModal.value) closeModal();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});

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
  if (saving.value) return;
  error.value = "";

  const module = selectedModule.value;

  if (module === "checklist" && !checklistForm.value.item.trim()) {
    error.value = "Enter an item name to save.";
    return;
  }

  if (
    (module === "tunang" || module === "nikah" || module === "wedding") &&
    !plannerForm.value.name.trim()
  ) {
    error.value = "Enter an item name to save.";
    return;
  }

  if (
    module === "savings" &&
    (!savingsForm.value.currentGoldPricePerGram || !savingsForm.value.purchasePrice)
  ) {
    error.value = "Enter the gold price and purchase price to save.";
    return;
  }

  saving.value = true;

  try {
    if (module === "checklist") await addChecklistItem(checklistForm.value);
    if (module === "tunang") await addTunangItem(plannerForm.value);
    if (module === "nikah") await addNikahItem(plannerForm.value);
    if (module === "wedding") await addWeddingItem(plannerForm.value);
    if (module === "savings") await addContribution(savingsForm.value);

    resetForms();
    closeModal();
  } catch (err) {
    console.error("Quick add failed:", err);
    error.value = "Couldn't save. Check your connection and try again.";
  } finally {
    saving.value = false;
  }
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

@media (max-width: 719px) {
  .fab {
    right: 16px;
    bottom: calc(max(10px, env(safe-area-inset-bottom)) + 78px);
    justify-content: center;
    width: 52px;
    height: 52px;
    padding: 0;
  }

  /* Icon-only on phones so it doesn't cover row values; the label stays for screen readers. */
  .fab span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
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
  width: 44px;
  height: 44px;
  margin: -6px -6px 0 0;
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

.save-btn:hover:not(:disabled) {
  opacity: 0.92;
}

.save-btn:disabled {
  opacity: 0.55;
  cursor: progress;
}

.form-error {
  margin: 0 4px 12px;
  color: var(--ap-red);
  font-size: 14px;
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

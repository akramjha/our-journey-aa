<template>
  <button class="floating-btn" @click="openModal">
    + Quick Add
  </button>

  <div v-if="showModal" class="overlay">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>✨ Quick Add</h2>
          <p>Add anything quickly from dashboard</p>
        </div>

        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="field">
        <label>Choose Module</label>
        <select v-model="selectedModule">
          <option value="checklist">📑 Checklist</option>
          <option value="tunang">💍 Tunang</option>
          <option value="nikah">🕊️ Nikah</option>
          <option value="wedding">👰 Wedding Event</option>
          <option value="savings">💰 Gold Savings</option>
        </select>
      </div>

      <!-- CHECKLIST -->
      <div v-if="selectedModule === 'checklist'">
        <div class="field">
          <label>Item</label>
          <input v-model="checklistForm.item" placeholder="Example: HIV Test" />
        </div>

        <div class="field">
          <label>Category</label>
          <select v-model="checklistForm.category">
            <option value="items">Items</option>
            <option value="borang_aina">Borang Aina</option>
            <option value="borang_akram">Borang Akram</option>
          </select>
        </div>

        <div class="field">
          <label>Notes</label>
          <textarea v-model="checklistForm.notes" placeholder="Any notes"></textarea>
        </div>
      </div>

      <!-- TUNANG / NIKAH / WEDDING -->
      <div v-if="selectedModule === 'tunang' || selectedModule === 'nikah' || selectedModule === 'wedding'">
        <div class="field">
          <label>Item Name</label>
          <input v-model="plannerForm.name" placeholder="Example: Venue, baju, MUA" />
        </div>

        <div class="field">
          <label>Category</label>
          <select v-model="plannerForm.category">
            <option
              v-for="cat in activeCategories"
              :key="cat.key"
              :value="cat.key"
            >
              {{ cat.icon }} {{ cat.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Price (RM)</label>
          <input type="number" v-model.number="plannerForm.price" />
        </div>

        <div class="field">
          <label>Vendor</label>
          <input v-model="plannerForm.vendor" placeholder="Optional" />
        </div>

        <div class="field">
          <label>Details</label>
          <textarea v-model="plannerForm.details" placeholder="Any details"></textarea>
        </div>
      </div>

      <!-- SAVINGS -->
      <div v-if="selectedModule === 'savings'">
        <div class="field">
          <label>Person</label>
          <select v-model="savingsForm.user">
            <option value="Aina">Aina</option>
            <option value="Akram">Akram</option>
          </select>
        </div>

        <div class="field">
          <label>Gold Price / g</label>
          <input
            type="number"
            v-model.number="savingsForm.currentGoldPricePerGram"
            placeholder="Example: 647"
          />
        </div>

        <div class="field">
          <label>Purchase Price (RM)</label>
          <input
            type="number"
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
import { ref, computed, watch } from "vue";

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
.floating-btn {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 50;
  border: none;
  padding: 14px 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7eb3, #a0c4ff);
  color: white;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(255, 126, 179, 0.35);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  width: min(520px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 28px;
  padding: 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  color: #d63384;
}

.modal-header p {
  margin: 6px 0 0;
  color: #777;
}

.close-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 999px;
  background: #ffe3e3;
  color: #d33;
  font-weight: 900;
  cursor: pointer;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
  font-weight: 700;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 13px;
  border-radius: 14px;
  border: 1px solid #eee;
  background: #fff;
  box-sizing: border-box;
  font-size: 14px;
}

.field textarea {
  min-height: 90px;
  resize: vertical;
}

.save-btn {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
  color: white;
  font-weight: 900;
  cursor: pointer;
}

@media (max-width: 768px) {
  .floating-btn {
    right: 18px;
    bottom: 18px;
    padding: 13px 18px;
  }

  .modal {
    padding: 22px;
    border-radius: 24px;
  }
}
</style>
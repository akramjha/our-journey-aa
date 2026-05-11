<template>
  <div>
    <header class="main-header">
      <h1>💍 Tunang Planner</h1>
      <p>Plan everything nicely, one step at a time ✨</p>
    </header>

    <div class="summary-grid">
      <div class="summary-card">
        <span>Total Budget</span>
        <h2>RM {{ totalPrice.toFixed(2) }}</h2>
      </div>

      <div class="summary-card">
        <span>Total Items</span>
        <h2>{{ items.length }}</h2>
      </div>

      <div class="summary-card">
        <span>Completed</span>
        <h2>{{ completedCount }}</h2>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="{ active: selectedCategory === cat.key }"
        @click="selectedCategory = cat.key"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <div class="form-card">
      <h2>➕ Add Item</h2>

      <div class="form-grid">
        <div class="field">
          <label>Category</label>
          <select v-model="form.category">
            <option v-for="cat in categories" :key="cat.key" :value="cat.key">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Item / Name</label>
          <input v-model="form.name" placeholder="Example: Dewan, Baju, Photographer" />
        </div>

        <div class="field">
          <label>Price (RM)</label>
          <input type="number" v-model.number="form.price" placeholder="Example: 500" />
        </div>

        <div class="field">
          <label>Quantity</label>
          <input type="number" v-model.number="form.quantity" placeholder="Optional" />
        </div>

        <div class="field">
          <label>Vendor</label>
          <input v-model="form.vendor" placeholder="Optional" />
        </div>

        <div class="field">
          <label>Progress</label>
          <select v-model="form.progress">
            <option value="NOT YET">NOT YET</option>
            <option value="PLANNING">PLANNING</option>
            <option value="BOOKED">BOOKED</option>
            <option value="PAID">PAID</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div class="field">
          <label>Due Date</label>
          <input type="date" v-model="form.dueDate" />
        </div>
      </div>

      <div class="field">
        <label>Details</label>
        <textarea v-model="form.details" placeholder="Any notes or details"></textarea>
      </div>

      <button class="save-btn" @click="addItem">
        + Save Item
      </button>
    </div>

    <div class="category-section">
      <div class="section-header">
        <h2>{{ currentCategory?.icon }} {{ currentCategory?.label }}</h2>
        <p>Total: RM {{ selectedTotal.toFixed(2) }}</p>
      </div>

      <div v-if="filteredItems.length === 0" class="empty">
        No item yet. Add one above ✨
      </div>

      <div class="item-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="['item-card', { completed: isCompleted(item) }]"
        >
          <div class="item-top">
            <div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.details || "No details" }}</p>

              <p v-if="item.dueDate" class="due-date">
                📅 Due: {{ formatDate(item.dueDate) }}
              </p>
            </div>

            <span class="badge" :class="badgeClass(item.progress)">
              {{ item.progress }}
            </span>
          </div>

          <label class="complete-row">
            <input
              type="checkbox"
              :checked="isCompleted(item)"
              @change="toggleCompleted(item)"
            />

            <span>
              {{ isCompleted(item) ? "Completed" : "Mark as completed" }}
            </span>
          </label>

          <div class="item-info">
            <div>
              <span>Price</span>
              <strong>RM {{ Number(item.price || 0).toFixed(2) }}</strong>
            </div>

            <div>
              <span>Qty</span>
              <strong>{{ item.quantity || "-" }}</strong>
            </div>

            <div>
              <span>Vendor</span>
              <strong>{{ item.vendor || "-" }}</strong>
            </div>
          </div>

          <div class="actions">
            <select
              :value="item.progress"
              @change="updateProgress(item.id!, ($event.target as HTMLSelectElement).value)"
            >
              <option value="NOT YET">NOT YET</option>
              <option value="PLANNING">PLANNING</option>
              <option value="BOOKED">BOOKED</option>
              <option value="PAID">PAID</option>
              <option value="DONE">DONE</option>
            </select>

            <button class="delete-btn" @click="removeItem(item.id!)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import {
  addTunangItem,
  listenTunangItems,
  deleteTunangItem,
  updateTunangItem
} from "@/services/tunangService";

import type { TunangItem } from "@/types/tunang";

const categories = [
  { key: "venue", label: "Venue Suggestion", icon: "🏛️" },
  { key: "attire", label: "Attire", icon: "👗" },
  { key: "hantaran_aina", label: "Hantaran Aina", icon: "🎁" },
  { key: "hantaran_akram", label: "Hantaran Akram", icon: "🎁" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "decor", label: "Decor", icon: "🌸" },
  { key: "extra_services", label: "Extra Services", icon: "📸" }
];

const selectedCategory = ref("venue");

const items = ref<TunangItem[]>([]);

const form = ref<TunangItem>({
  category: "venue",
  name: "",
  price: 0,
  quantity: undefined,
  vendor: "",
  details: "",
  progress: "NOT YET",
  completed: false,
  dueDate: ""
});

onMounted(() => {
  listenTunangItems((data) => {
    items.value = data;
  });
});

const isCompleted = (item: TunangItem) => {
  return (
    item.completed === true ||
    item.progress === "DONE" ||
    item.progress === "PAID"
  );
};

const currentCategory = computed(() =>
  categories.find((cat) => cat.key === selectedCategory.value)
);

const filteredItems = computed(() =>
  items.value.filter((item) => item.category === selectedCategory.value)
);

const totalPrice = computed(() =>
  items.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
);

const selectedTotal = computed(() =>
  filteredItems.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
);

const completedCount = computed(() =>
  items.value.filter((item) => isCompleted(item)).length
);

const addItem = async () => {
  if (!form.value.name.trim()) return;

  const completed =
    form.value.progress === "DONE" || form.value.progress === "PAID";

  await addTunangItem({
    ...form.value,
    price: Number(form.value.price || 0),
    quantity: form.value.quantity || undefined,
    completed
  });

  form.value = {
    category: selectedCategory.value,
    name: "",
    price: 0,
    quantity: undefined,
    vendor: "",
    details: "",
    progress: "NOT YET",
    completed: false,
    dueDate: ""
  };
};

const toggleCompleted = async (item: TunangItem) => {
  if (!item.id) return;

  const newCompleted = !isCompleted(item);

  await updateTunangItem(item.id, {
    completed: newCompleted,
    progress: newCompleted ? "DONE" : "NOT YET"
  });
};

const removeItem = async (id: string) => {
  await deleteTunangItem(id);
};

const updateProgress = async (id: string, progress: string) => {
  await updateTunangItem(id, {
    progress,
    completed: progress === "DONE" || progress === "PAID"
  });
};

const badgeClass = (progress: string) => {
  if (progress === "DONE") return "done";
  if (progress === "PAID") return "paid";
  if (progress === "BOOKED") return "booked";
  if (progress === "PLANNING") return "planning";
  return "not-yet";
};

const formatDate = (date: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};
</script>

<style scoped>
.main-header {
  text-align: center;
  margin-bottom: 34px;
}

.main-header h1 {
  font-size: 42px;
  margin-bottom: 10px;
}

.main-header p {
  color: #777;
  font-size: 18px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 28px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.05);
}

.summary-card span {
  color: #777;
  font-size: 13px;
}

.summary-card h2 {
  margin: 8px 0 0;
}

.tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.tabs button {
  border: none;
  padding: 12px 16px;
  border-radius: 999px;
  background: white;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}

.tabs button.active {
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
  color: white;
}

.form-card,
.category-section {
  background: white;
  padding: 28px;
  border-radius: 28px;
  margin-bottom: 28px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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

.field input,
.field select,
.field textarea,
.actions select {
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
  border-radius: 14px;
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-header p {
  color: #777;
  font-weight: 700;
}

.empty {
  padding: 24px;
  border-radius: 20px;
  background: #fff7fb;
  color: #777;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.item-card {
  background: #fff7fb;
  padding: 20px;
  border-radius: 22px;
  border: 1px solid rgba(255, 182, 193, 0.35);
}

.item-card.completed {
  background: #f3fff6;
  border-color: rgba(19, 148, 71, 0.25);
}

.item-card.completed h3 {
  text-decoration: line-through;
  color: #139447;
}

.complete-row {
  margin: 12px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #777;
  cursor: pointer;
  user-select: none;
}

.complete-row input {
  width: 16px;
  height: 16px;
  accent-color: #ff7eb3;
}

.item-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.item-top h3 {
  margin: 0;
}

.item-top p {
  color: #777;
  margin-top: 6px;
}

.due-date {
  display: inline-block;
  margin-top: 8px;
  color: #d63384 !important;
  font-size: 13px;
  font-weight: 800;
}

.badge {
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.not-yet {
  background: #ffe3e3;
  color: #d33;
}

.planning {
  background: #fff2c7;
  color: #9a6a00;
}

.booked {
  background: #e6f0ff;
  color: #2f6cd6;
}

.paid {
  background: #efe6ff;
  color: #7c3aed;
}

.done {
  background: #dfffe8;
  color: #139447;
}

.item-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.item-info div {
  background: white;
  padding: 12px;
  border-radius: 14px;
}

.item-info span {
  display: block;
  color: #777;
  font-size: 12px;
  margin-bottom: 5px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.delete-btn {
  border: none;
  padding: 12px 16px;
  border-radius: 14px;
  background: #ffe3e3;
  color: #d33;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 768px) {
  .main-header h1 {
    font-size: 32px;
  }

  .main-header p {
    font-size: 15px;
  }

  .summary-grid,
  .form-grid,
  .item-info {
    grid-template-columns: 1fr;
  }

  .form-card,
  .category-section,
  .summary-card {
    padding: 20px;
    border-radius: 22px;
  }

  .section-header,
  .item-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
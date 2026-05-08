<template>
  <div>
    <!-- HEADER -->
    <header class="main-header">
      <h1>📑 Borang Checklist</h1>
      <p>Track nikah documents, forms and submissions ✨</p>
    </header>

    <!-- SUMMARY -->
    <div class="summary-grid">

      <div class="summary-card">
        <span>Total Items</span>
        <h2>{{ items.length }}</h2>
      </div>

      <div class="summary-card">
        <span>Completed</span>
        <h2>{{ completedCount }}</h2>
      </div>

      <div class="summary-card">
        <span>Progress</span>
        <h2>{{ completionPercent }}%</h2>
      </div>

    </div>

    <!-- PROGRESS -->
    <div class="progress-card">

      <div class="progress-top">
        <h2>Checklist Completion</h2>

        <span>
          {{ completedCount }} / {{ items.length }}
        </span>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${completionPercent}%` }"
        ></div>
      </div>

    </div>

    <!-- CATEGORY -->
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

    <!-- FORM -->
    <div class="form-card">

      <h2>➕ Add Checklist Item</h2>

      <div class="form-grid">

        <div class="field">
          <label>Category</label>

          <select v-model="form.category">
            <option
              v-for="cat in categories"
              :key="cat.key"
              :value="cat.key"
            >
              {{ cat.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Item</label>

          <input
            v-model="form.item"
            placeholder="Example: HIV Test"
          />
        </div>

        <div class="field">
          <label>Progress</label>

          <select v-model="form.progress">
            <option value="NOT YET">NOT YET</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

      </div>

      <!-- NOTES -->
      <div class="field">
        <label>Notes</label>

        <textarea
          v-model="form.notes"
          placeholder="Any notes or reminders"
        ></textarea>
      </div>

      <button
        class="save-btn"
        @click="addItem"
      >
        + Save Item
      </button>

    </div>

    <!-- ITEMS -->
    <div class="category-section">

      <div class="section-header">

        <div>
          <h2>
            {{ currentCategory?.icon }}
            {{ currentCategory?.label }}
          </h2>

          <p>
            {{ filteredItems.length }} item(s)
          </p>
        </div>

        <span class="section-percent">
          {{ selectedCompletionPercent }}%
        </span>

      </div>

      <div
        v-if="filteredItems.length === 0"
        class="empty"
      >
        No checklist item yet ✨
      </div>

      <!-- CARDS -->
      <div class="item-grid">

        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
        >

          <div class="item-top">

            <div>

              <h3>
                {{ item.item }}
              </h3>

              <p>
                {{ item.notes || "No notes yet" }}
              </p>

              <!-- FILE LINK -->
              <a
                v-if="item.fileUrl"
                :href="getViewUrl(item.fileUrl)"
                target="_blank"
                class="file-link"
              >
                📎 View Uploaded File
              </a>

              <!-- FILE UPLOAD -->
              <div class="upload-row">

                <input
                  type="file"
                  @change="uploadFileForItem($event, item.id!)"
                />

              </div>

            </div>

            <!-- STATUS -->
            <span
              class="badge"
              :class="badgeClass(item.progress)"
            >
              {{ item.progress }}
            </span>

          </div>

          <!-- ACTION -->
          <div class="actions">

            <select
              :value="item.progress"
              @change="updateProgress(item.id!, ($event.target as HTMLSelectElement).value)"
            >
              <option value="NOT YET">NOT YET</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DONE">DONE</option>
            </select>

            <button
              class="delete-btn"
              @click="removeItem(item.id!)"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted
} from "vue";

import {
  addChecklistItem,
  listenChecklistItems,
  deleteChecklistItem,
  updateChecklistItem
} from "@/services/checklistService";

import { uploadToCloudinary }
from "@/services/uploadService";

import type { ChecklistItem }
from "@/types/checklist";

/* CATEGORY */
const categories = [
  {
    key: "items",
    label: "Items",
    icon: "✅"
  },
  {
    key: "borang_aina",
    label: "Borang Aina",
    icon: "🌸"
  },
  {
    key: "borang_akram",
    label: "Borang Akram",
    icon: "💙"
  }
];

const selectedCategory =
  ref("items");

const items =
  ref<ChecklistItem[]>([]);

/* FORM */
const form = ref<ChecklistItem>({
  category: "items",
  item: "",
  progress: "NOT YET",
  notes: "",
  fileUrl: "",
  fileName: ""
});

/* REALTIME */
onMounted(() => {

  listenChecklistItems((data) => {
    items.value = data;
  });

});

/* FILTER */
const currentCategory = computed(() =>
  categories.find(
    (cat) =>
      cat.key === selectedCategory.value
  )
);

const filteredItems = computed(() =>
  items.value.filter(
    (item) =>
      item.category === selectedCategory.value
  )
);

/* PROGRESS */
const completedCount = computed(() =>
  items.value.filter(
    (item) =>
      item.progress === "DONE" ||
      item.progress === "APPROVED"
  ).length
);

const completionPercent = computed(() => {

  if (items.value.length === 0)
    return 0;

  return Math.round(
    (
      completedCount.value /
      items.value.length
    ) * 100
  );

});

const selectedCompletedCount =
computed(() =>
  filteredItems.value.filter(
    (item) =>
      item.progress === "DONE" ||
      item.progress === "APPROVED"
  ).length
);

const selectedCompletionPercent =
computed(() => {

  if (filteredItems.value.length === 0)
    return 0;

  return Math.round(
    (
      selectedCompletedCount.value /
      filteredItems.value.length
    ) * 100
  );

});

/* ADD ITEM */
const addItem = async () => {

  if (!form.value.item.trim())
    return;

  await addChecklistItem({
    ...form.value,
    fileUrl: "",
    fileName: ""
  });

  form.value = {
    category: selectedCategory.value,
    item: "",
    progress: "NOT YET",
    notes: "",
    fileUrl: "",
    fileName: ""
  };

};

/* UPLOAD FILE */
const uploadFileForItem = async (
  event: Event,
  id: string
) => {

  const target =
    event.target as HTMLInputElement;

  const file =
    target.files?.[0];

  if (!file) return;

  const uploaded =
    await uploadToCloudinary(file);

  await updateChecklistItem(id, {
    fileUrl: uploaded.url,
    fileName: uploaded.name
  });

  target.value = "";

};

/* VIEW URL */
const getViewUrl = (
  url: string
) => {

  if (url.includes("/raw/upload/")) {

    return url.replace(
      "/raw/upload/",
      "/raw/upload/fl_attachment/"
    );

  }

  return url;

};

/* DELETE */
const removeItem = async (
  id: string
) => {

  await deleteChecklistItem(id);

};

/* UPDATE */
const updateProgress = async (
  id: string,
  progress: string
) => {

  await updateChecklistItem(
    id,
    { progress }
  );

};

/* BADGE */
const badgeClass = (
  progress: string
) => {

  if (progress === "DONE")
    return "done";

  if (progress === "APPROVED")
    return "approved";

  if (progress === "SUBMITTED")
    return "submitted";

  if (progress === "IN PROGRESS")
    return "progress";

  return "not-yet";

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

/* SUMMARY */
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
  box-shadow:
    0 10px 24px rgba(0,0,0,0.05);
}

.summary-card span {
  color: #777;
  font-size: 13px;
}

/* PROGRESS */
.progress-card {
  background: white;
  padding: 26px;
  border-radius: 26px;
  margin-bottom: 28px;
  box-shadow:
    0 10px 24px rgba(0,0,0,0.05);
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-top span {
  font-weight: 800;
}

.progress-bar {
  margin-top: 18px;
  height: 16px;
  background: #eee;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background:
    linear-gradient(
      135deg,
      #ffb6c1,
      #a0c4ff
    );
}

/* TABS */
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
}

.tabs button.active {
  background:
    linear-gradient(
      135deg,
      #ffb6c1,
      #a0c4ff
    );

  color: white;
}

/* FORM */
.form-card,
.category-section {
  background: white;
  padding: 28px;
  border-radius: 28px;
  margin-bottom: 28px;
  box-shadow:
    0 10px 24px rgba(0,0,0,0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  background:
    linear-gradient(
      135deg,
      #ffb6c1,
      #a0c4ff
    );

  color: white;
  font-weight: 800;
  cursor: pointer;
}

/* ITEMS */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-percent {
  background: #f5f5f5;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 800;
}

.empty {
  padding: 24px;
  border-radius: 20px;
  background: #fff7fb;
  color: #777;
}

.item-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(280px, 1fr));

  gap: 18px;
}

.item-card {
  background: #fff7fb;
  padding: 20px;
  border-radius: 22px;
  border:
    1px solid rgba(255, 182, 193, 0.35);
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

.file-link {
  display: inline-block;
  margin-top: 10px;
  color: #d63384;
  font-weight: 700;
  text-decoration: none;
}

/* UPLOAD */
.upload-row {
  margin-top: 12px;
}

.upload-row input {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: white;
  border: 1px solid #eee;
}

/* BADGE */
.badge {
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.not-yet {
  background: #ffe3e3;
  color: #d33;
}

.progress {
  background: #fff2c7;
  color: #9a6a00;
}

.submitted {
  background: #e6f0ff;
  color: #2f6cd6;
}

.approved {
  background: #efe6ff;
  color: #7c3aed;
}

.done {
  background: #dfffe8;
  color: #139447;
}

/* ACTION */
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

/* MOBILE */
@media (max-width: 768px) {

  .main-header h1 {
    font-size: 32px;
  }

  .main-header p {
    font-size: 15px;
  }

  .summary-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-card,
  .category-section,
  .summary-card,
  .progress-card {
    padding: 20px;
    border-radius: 22px;
  }

  .section-header,
  .progress-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .actions {
    grid-template-columns: 1fr;
  }

}
</style>
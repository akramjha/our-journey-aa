<template>
  <div class="checklist">
    <header class="title-block">
      <h1>Borang Checklist</h1>
      <p>Track nikah documents, forms and submissions.</p>
    </header>

    <section class="group summary" aria-label="Summary">
      <div class="stat">
        <span class="stat-label">Total</span>
        <span class="stat-value">{{ items.length }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Completed</span>
        <span class="stat-value">{{ completedCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Progress</span>
        <span class="stat-value accent">{{ completionPercent }}<small>%</small></span>
      </div>
    </section>

    <section class="block" aria-labelledby="completion-title">
      <div class="section-head">
        <h2 id="completion-title">Completion</h2>
        <span class="count">{{ completedCount }} / {{ items.length }}</span>
      </div>
      <div class="group pad">
        <div
          class="bar"
          role="progressbar"
          :aria-valuenow="completionPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Checklist completion"
        >
          <div class="bar-fill" :style="{ width: `${completionPercent}%` }"></div>
        </div>
      </div>
    </section>

    <div class="tabs" role="tablist" aria-label="Checklist category">
      <button
        v-for="cat in categories"
        :key="cat.key"
        type="button"
        role="tab"
        :aria-selected="selectedCategory === cat.key"
        :class="{ active: selectedCategory === cat.key }"
        @click="selectedCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <section class="block" aria-labelledby="add-title">
      <div class="section-head">
        <h2 id="add-title">Add an item</h2>
      </div>

      <form class="group pad form" @submit.prevent="addItem">
        <div class="form-grid">
          <div class="field">
            <label for="cl-category">Category</label>
            <select id="cl-category" v-model="form.category">
              <option v-for="cat in categories" :key="cat.key" :value="cat.key">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="cl-item">Item</label>
            <input id="cl-item" v-model="form.item" placeholder="Example: HIV Test" />
          </div>

          <div class="field">
            <label for="cl-progress">Progress</label>
            <select id="cl-progress" v-model="form.progress">
              <option value="NOT YET">NOT YET</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div class="field">
            <label for="cl-due">Due date</label>
            <input id="cl-due" type="date" v-model="form.dueDate" />
          </div>
        </div>

        <div class="field">
          <label for="cl-notes">Notes</label>
          <textarea
            id="cl-notes"
            v-model="form.notes"
            placeholder="Any notes or reminders"
          ></textarea>
        </div>

        <button class="primary" type="submit">
          <AppIcon name="plus" />
          Save item
        </button>
      </form>
    </section>

    <section class="block" aria-labelledby="category-title">
      <div class="section-head">
        <h2 id="category-title">{{ currentCategory?.label }}</h2>
        <span class="count">
          {{ filteredItems.length }} {{ filteredItems.length === 1 ? "item" : "items" }}
          · {{ selectedCompletionPercent }}%
        </span>
      </div>

      <p v-if="filteredItems.length === 0" class="empty">
        Nothing here yet. Add your first item above.
      </p>

      <ul v-else class="group list">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          class="item"
          :class="{ completed: isCompleted(item) }"
        >
          <div class="item-top">
            <label class="check">
              <input
                type="checkbox"
                :checked="isCompleted(item)"
                :aria-label="isCompleted(item) ? 'Completed' : 'Mark as completed'"
                @change="toggleCompleted(item)"
              />
            </label>

            <div class="item-main">
              <span class="title">{{ item.item }}</span>
              <span class="meta">{{ item.notes || "No notes yet" }}</span>
              <span v-if="item.dueDate" class="meta due">
                <AppIcon name="calendar" />
                Due {{ formatDate(item.dueDate) }}
              </span>
            </div>

            <span class="badge" :class="badgeClass(item.progress)">
              {{ item.progress }}
            </span>
          </div>

          <div class="item-body">
            <div class="file-section">
              <label class="file-label">
                <span>Add files or pictures</span>
                <input
                  type="file"
                  multiple
                  @change="uploadFilesForItem($event, item)"
                />
              </label>

              <ul v-if="item.files && item.files.length > 0" class="file-list">
                <li
                  v-for="(file, index) in item.files"
                  :key="file.url"
                  class="file-row"
                >
                  <div class="file-main">
                    <a :href="file.url" target="_blank" rel="noopener" class="file-link">
                      <AppIcon name="paperclip" />
                      <span>{{ file.name }}</span>
                    </a>
                    <img
                      v-if="isImage(file.type)"
                      :src="file.url"
                      :alt="file.name"
                      class="preview"
                    />
                  </div>

                  <button
                    type="button"
                    class="text-btn danger"
                    :aria-label="`Remove ${file.name}`"
                    @click="removeFileFromItem(item, index)"
                  >
                    Remove
                  </button>
                </li>
              </ul>
            </div>

            <div class="actions">
              <select
                :value="item.progress"
                aria-label="Progress"
                @change="updateProgress(item.id!, ($event.target as HTMLSelectElement).value)"
              >
                <option value="NOT YET">NOT YET</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="DONE">DONE</option>
              </select>

              <button type="button" class="text-btn danger" @click="removeItem(item.id!)">
                Delete item
              </button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

import {
  addChecklistItem,
  listenChecklistItems,
  deleteChecklistItem,
  updateChecklistItem
} from "@/services/checklistService";

import { uploadToCloudinary } from "@/services/uploadService";

import type { ChecklistItem, ChecklistFile } from "@/types/checklist";

const categories = [
  { key: "items", label: "Items", icon: "✅" },
  { key: "borang_aina", label: "Borang Aina", icon: "🌸" },
  { key: "borang_akram", label: "Borang Akram", icon: "💙" }
];

const selectedCategory = ref("items");

const items = ref<ChecklistItem[]>([]);

const form = ref<ChecklistItem>({
  category: "items",
  item: "",
  progress: "NOT YET",
  notes: "",
  files: [],
  completed: false,
  dueDate: ""
});

onMounted(() => {
  listenChecklistItems((data) => {
    items.value = data;
  });
});

const isCompleted = (item: ChecklistItem) => {
  return (
    item.completed === true ||
    item.progress === "DONE" ||
    item.progress === "APPROVED"
  );
};

const currentCategory = computed(() =>
  categories.find((cat) => cat.key === selectedCategory.value)
);

const filteredItems = computed(() =>
  items.value.filter((item) => item.category === selectedCategory.value)
);

const completedCount = computed(() =>
  items.value.filter((item) => isCompleted(item)).length
);

const completionPercent = computed(() => {
  if (items.value.length === 0) return 0;
  return Math.round((completedCount.value / items.value.length) * 100);
});

const selectedCompletedCount = computed(() =>
  filteredItems.value.filter((item) => isCompleted(item)).length
);

const selectedCompletionPercent = computed(() => {
  if (filteredItems.value.length === 0) return 0;

  return Math.round(
    (selectedCompletedCount.value / filteredItems.value.length) * 100
  );
});

const addItem = async () => {
  if (!form.value.item.trim()) return;

  await addChecklistItem({
    ...form.value,
    completed:
      form.value.progress === "DONE" || form.value.progress === "APPROVED",
    files: []
  });

  form.value = {
    category: selectedCategory.value,
    item: "",
    progress: "NOT YET",
    notes: "",
    files: [],
    completed: false,
    dueDate: ""
  };
};

const toggleCompleted = async (item: ChecklistItem) => {
  if (!item.id) return;

  const newCompleted = !isCompleted(item);

  await updateChecklistItem(item.id, {
    completed: newCompleted,
    progress: newCompleted ? "DONE" : "NOT YET"
  });
};

const updateProgress = async (id: string, progress: string) => {
  await updateChecklistItem(id, {
    progress,
    completed: progress === "DONE" || progress === "APPROVED"
  });
};

const uploadFilesForItem = async (
  event: Event,
  item: ChecklistItem
) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (!item.id || files.length === 0) return;

  const uploadedFiles: ChecklistFile[] = [];

  for (const file of files) {
    const uploaded = await uploadToCloudinary(file);

    uploadedFiles.push({
      url: uploaded.url,
      name: uploaded.name,
      type: uploaded.type
    });
  }

  const existingFiles = item.files || [];

  await updateChecklistItem(item.id, {
    files: [...existingFiles, ...uploadedFiles]
  });

  target.value = "";
};

const removeFileFromItem = async (
  item: ChecklistItem,
  index: number
) => {
  if (!item.id) return;

  const updatedFiles = [...(item.files || [])];
  updatedFiles.splice(index, 1);

  await updateChecklistItem(item.id, {
    files: updatedFiles
  });
};

const removeItem = async (id: string) => {
  await deleteChecklistItem(id);
};

const badgeClass = (progress: string) => {
  if (progress === "DONE") return "done";
  if (progress === "APPROVED") return "approved";
  if (progress === "SUBMITTED") return "submitted";
  if (progress === "IN PROGRESS") return "progress";

  return "not-yet";
};

const isImage = (type: string) => {
  return type.startsWith("image/");
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
.checklist {
  display: grid;
  gap: 32px;
  min-width: 0;
}

.title-block {
  margin: 0 4px -8px;
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

.group {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  border-radius: var(--ap-radius);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
  overflow: hidden;
}

.group.pad {
  padding: 16px;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px 10px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.count {
  color: var(--ap-label-2);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat {
  display: grid;
  gap: 4px;
  padding: 18px 16px;
}

.stat + .stat {
  box-shadow: inset 0.5px 0 0 var(--ap-separator);
}

.stat-label {
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.stat-value {
  font-size: clamp(28px, 6vw, 38px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.stat-value.accent {
  color: var(--ap-accent);
}

.stat-value small {
  margin-left: 2px;
  color: var(--ap-label-2);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0;
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--ap-fill);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--ap-accent);
  transition: width 1s var(--ap-ease);
}

/* Tabs: segmented control */
.tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 14px;
  background: var(--ap-fill);
}

.tabs button {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 0 10px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: var(--ap-label);
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s var(--ap-ease);
}

.tabs button.active {
  background: var(--ap-surface);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* Form */
.form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.field label {
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

input:not([type="checkbox"]):not([type="file"]),
select,
textarea {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--ap-surface-2);
  color: var(--ap-label);
  font: inherit;
  font-size: 16px;
  transition: border-color 0.2s var(--ap-ease), box-shadow 0.2s var(--ap-ease);
}

textarea {
  min-height: 88px;
  resize: vertical;
}

input:not([type="checkbox"]):not([type="file"]):focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--ap-accent);
  box-shadow: 0 0 0 3px var(--ap-accent-soft);
}

::placeholder {
  color: var(--ap-label-2);
  opacity: 0.8;
}

.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: var(--ap-accent);
  color: #fff;
  font: inherit;
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

/* List */
.empty {
  margin: 0;
  padding: 20px 16px;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  box-shadow: var(--ap-glass-edge);
  border-radius: var(--ap-radius);
  color: var(--ap-label-2);
  font-size: 15px;
}

.item {
  display: grid;
  gap: 12px;
  padding: 8px 16px 16px 4px;
}

.item + .item {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.item-top {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.check {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  cursor: pointer;
}

.check input {
  width: 22px;
  height: 22px;
  margin: 0;
  accent-color: var(--ap-accent);
  cursor: pointer;
}

.item-main {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
  padding-top: 10px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.item.completed .title {
  color: var(--ap-label-2);
  text-decoration: line-through;
}

.meta {
  color: var(--ap-label-2);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}

.badge {
  flex: none;
  margin-top: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--ap-fill);
  color: var(--ap-label-2);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.not-yet {
  background: color-mix(in srgb, var(--ap-red) 14%, transparent);
  color: var(--ap-red);
}

.badge.progress {
  background: color-mix(in srgb, var(--ap-orange) 16%, transparent);
  color: var(--ap-orange);
}

.badge.submitted {
  background: color-mix(in srgb, var(--ap-blue) 13%, transparent);
  color: var(--ap-blue);
}

.badge.approved {
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
}

.badge.done {
  background: var(--ap-fill);
  color: var(--ap-label-2);
}

.item-body {
  display: grid;
  gap: 12px;
  margin-left: 48px;
}

.file-section {
  display: grid;
  gap: 8px;
}

.file-label {
  display: grid;
  gap: 6px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.file-label input {
  max-width: 100%;
  min-width: 0;
  color: var(--ap-label);
  font: inherit;
  font-size: 14px;
}

.file-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 12px;
  background: var(--ap-surface-2);
  overflow: hidden;
}

.file-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 4px 12px;
}

.file-row + .file-row {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.file-main {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px 0;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ap-accent);
  font-size: 15px;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.file-link span {
  min-width: 0;
}

.preview {
  display: block;
  max-width: 120px;
  height: auto;
  border-radius: 10px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions select {
  flex: 1;
  min-width: 0;
}

.text-btn {
  flex: none;
  min-height: 44px;
  padding: 0 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--ap-accent);
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s var(--ap-ease);
}

.text-btn:hover {
  background: var(--ap-fill);
}

.text-btn.danger {
  color: var(--ap-red);
}

@media (min-width: 720px) {
  .form-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .group.pad {
    padding: 20px;
  }

  .primary {
    justify-self: start;
  }
}

@media (max-width: 420px) {
  .stat {
    padding: 16px 12px;
  }

  .item-top {
    flex-wrap: wrap;
  }

  .item-main {
    flex-basis: calc(100% - 52px);
  }

  .badge {
    margin: 0 0 0 48px;
  }
}
</style>

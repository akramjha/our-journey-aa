<template>
  <div class="planner">
    <header class="title-block">
      <h1>Nikah Planner</h1>
      <p>Track hantaran, attire, decor, wishlist and inspiration.</p>
    </header>

    <section class="group stats" aria-label="Summary">
      <div class="stat">
        <span class="stat-label">Total budget</span>
        <span class="stat-value"><small>RM</small>{{ money(totalPrice) }}</span>
      </div>

      <div class="stat">
        <span class="stat-label">Total items</span>
        <span class="stat-value">{{ items.length }}</span>
      </div>

      <div class="stat">
        <span class="stat-label">Completed</span>
        <span class="stat-value">{{ completedCount }}</span>
      </div>

      <div class="stat">
        <span class="stat-label">Urgent</span>
        <span class="stat-value">{{ urgentCount }}</span>
      </div>
    </section>

    <nav class="tabs" aria-label="Categories">
      <button
        v-for="cat in categories"
        :key="cat.key"
        type="button"
        class="tab"
        :class="{ active: selectedCategory === cat.key }"
        :aria-pressed="selectedCategory === cat.key"
        @click="selectedCategory = cat.key"
      >
        <AppIcon :name="categoryIcon(cat.key)" />
        {{ cat.label }}
      </button>
    </nav>

    <section aria-labelledby="form-title">
      <div class="section-head">
        <h2 id="form-title">{{ editId ? "Edit nikah item" : "Add nikah item" }}</h2>
        <button
          v-if="!editId"
          type="button"
          class="btn plain toggle"
          :aria-expanded="showForm"
          aria-controls="item-form"
          @click="showForm = !showForm"
        >
          {{ showForm ? "Close" : "Add item" }}
        </button>
      </div>

      <div v-if="formOpen" id="item-form" ref="formEl" class="group form">
        <div class="form-grid">
          <div class="field">
            <label for="f-category">Category</label>
            <select id="f-category" v-model="form.category">
              <option v-for="cat in categories" :key="cat.key" :value="cat.key">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="f-name">Item name</label>
            <input id="f-name" v-model="form.name" placeholder="Example: Perfume, cincin, MUA" />
          </div>

          <div class="field">
            <label for="f-price">Price (RM)</label>
            <input id="f-price" type="number" inputmode="decimal" v-model.number="form.price" placeholder="Example: 500" />
          </div>

          <div class="field">
            <label for="f-vendor">Vendor</label>
            <input id="f-vendor" v-model="form.vendor" placeholder="Example: Shopee ,vendor name" />
          </div>

          <div class="field">
            <label for="f-progress">Progress</label>
            <select id="f-progress" v-model="form.progress">
              <option value="NOT YET">NOT YET</option>
              <option value="SURVEY">SURVEY</option>
              <option value="BOOKED">BOOKED</option>
              <option value="PAID">PAID</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div class="field">
            <label for="f-due">Due date</label>
            <input id="f-due" type="date" v-model="form.dueDate" />
          </div>

          <div class="field">
            <label for="f-priority">Priority</label>
            <select id="f-priority" v-model="form.priority">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="f-link">Wishlist / inspiration link</label>
          <input id="f-link" v-model="form.wishlistLink" placeholder="Shopee / TikTok / Pinterest / Instagram link" />
        </div>

        <div class="field">
          <label for="f-details">Details</label>
          <textarea id="f-details" v-model="form.details" placeholder="Example: size, color theme, notes"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn primary" @click="submitItem">
            {{ editId ? "Save changes" : "Save item" }}
          </button>

          <button v-if="editId" type="button" class="btn plain" @click="cancelEdit">
            Cancel
          </button>
        </div>
      </div>
    </section>

    <section aria-labelledby="category-title">
      <div class="section-head">
        <h2 id="category-title">
          <AppIcon :name="categoryIcon(selectedCategory)" />
          {{ currentCategory?.label }}
        </h2>
        <span class="meta">
          {{ filteredItems.length }} {{ filteredItems.length === 1 ? "item" : "items" }} · RM {{ money(selectedTotal) }} · {{ selectedCompletionPercent }}% done
        </span>
      </div>

      <p v-if="filteredItems.length === 0" class="empty">
        Nothing here yet. Add the first item above.
      </p>

      <ul v-else class="group">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          class="item"
          :class="{ completed: isCompleted(item) }"
        >
          <div class="item-top">
            <div class="item-main">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-details">{{ item.details || "No details yet" }}</p>

              <a
                v-if="item.wishlistLink"
                :href="item.wishlistLink"
                target="_blank"
                rel="noopener"
                class="inline-link"
              >
                <AppIcon name="link" />
                Open wishlist / inspiration
              </a>
            </div>

            <div class="chips">
              <span class="chip" :class="badgeClass(item.progress)">
                {{ item.progress }}
              </span>
              <span class="chip" :class="priorityClass(item.priority || 'LOW')">
                {{ item.priority || "LOW" }}
              </span>
            </div>
          </div>

          <label class="complete-row">
            <input
              type="checkbox"
              :checked="isCompleted(item)"
              @change="toggleCompleted(item)"
            />
            <span>{{ isCompleted(item) ? "Completed" : "Mark as completed" }}</span>
          </label>

          <dl class="facts">
            <div>
              <dt>Price</dt>
              <dd>RM {{ money(item.price) }}</dd>
            </div>

            <div>
              <dt>Vendor</dt>
              <dd>{{ item.vendor || "-" }}</dd>
            </div>
          </dl>

          <div class="files">
            <label class="file-label">Upload inspiration / receipt / picture</label>

            <input
              type="file"
              multiple
              class="file-input"
              aria-label="Upload inspiration, receipt or picture"
              @change="uploadFilesForItem($event, item)"
            />

            <ul v-if="item.files && item.files.length > 0" class="file-list">
              <li
                v-for="(file, index) in item.files"
                :key="file.url"
                class="file-row"
              >
                <a :href="file.url" target="_blank" rel="noopener" class="file-link">
                  <AppIcon :name="isImage(file.type) ? 'image' : 'paperclip'" />
                  {{ file.name }}
                </a>

                <button type="button" class="btn danger small" @click="removeFileFromItem(item, index)">
                  Remove
                </button>
              </li>
            </ul>
          </div>

          <div v-if="imageFiles(item).length > 0" class="gallery">
            <a
              v-for="file in imageFiles(item)"
              :key="file.url"
              :href="file.url"
              target="_blank"
              rel="noopener"
            >
              <img :src="file.url" :alt="file.name" loading="lazy" />
            </a>
          </div>

          <div class="actions">
            <select
              :value="item.progress"
              aria-label="Progress"
              @change="updateProgress(item.id!, ($event.target as HTMLSelectElement).value)"
            >
              <option value="NOT YET">NOT YET</option>
              <option value="SURVEY">SURVEY</option>
              <option value="BOOKED">BOOKED</option>
              <option value="PAID">PAID</option>
              <option value="DONE">DONE</option>
            </select>

            <button type="button" class="btn plain" @click="startEdit(item)">Edit</button>
            <button type="button" class="btn danger" @click="removeItem(item.id!)">Delete</button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";

import AppIcon from "@/components/ui/AppIcon.vue";
import type { IconName } from "@/components/ui/AppIcon.vue";

import {
  addNikahItem,
  listenNikahItems,
  deleteNikahItem,
  updateNikahItem
} from "@/services/nikahService";

import { uploadToCloudinary } from "@/services/uploadService";
import type { NikahItem, NikahFile } from "@/types/nikah";

const categories = [
  { key: "attire", label: "Attire" },
  { key: "hantaran_aina", label: "Hantaran Aina" },
  { key: "hantaran_akram", label: "Hantaran Akram" },
  { key: "dulang_mas_kahwin", label: "Dulang Mas Kahwin" },
  { key: "decor", label: "Decor" },
  { key: "extra_services", label: "Extra Services" }
];

const selectedCategory = ref("attire");
const items = ref<NikahItem[]>([]);
const editId = ref<string | null>(null);

// The form stays collapsed so the item list is the first thing on the page.
const showForm = ref(false);
const formEl = ref<HTMLElement | null>(null);
const formOpen = computed(() => showForm.value || editId.value !== null);

const money = (value: number) =>
  Number(value || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const form = ref<NikahItem>({
  category: "attire",
  name: "",
  price: 0,
  vendor: "",
  details: "",
  progress: "NOT YET",
  priority: "LOW",
  wishlistLink: "",
  files: [],
  dueDate: "",
  completed: false,
});

onMounted(() => {
  listenNikahItems((data) => {
    items.value = data;
  });
});

const isCompleted = (item: NikahItem) => {
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

const urgentCount = computed(() =>
  items.value.filter((item) => item.priority === "URGENT").length
);

const selectedCompletedCount = computed(() =>
  filteredItems.value.filter((item) => isCompleted(item)).length
);

const selectedCompletionPercent = computed(() => {
  if (filteredItems.value.length === 0) return 0;

  return Math.round(
    (selectedCompletedCount.value / filteredItems.value.length) * 100
  );
});

const resetForm = () => {
  form.value = {
    category: selectedCategory.value,
    name: "",
    price: 0,
    vendor: "",
    details: "",
    progress: "NOT YET",
    priority: "LOW",
    wishlistLink: "",
    files: [],
    completed: false
  };

  editId.value = null;
};

const submitItem = async () => {
  if (!form.value.name.trim()) return;

  const completed =
    form.value.progress === "DONE" || form.value.progress === "PAID";

  if (editId.value) {
    await updateNikahItem(editId.value, {
      category: form.value.category,
      name: form.value.name,
      price: Number(form.value.price || 0),
      vendor: form.value.vendor || "",
      details: form.value.details || "",
      progress: form.value.progress,
      priority: form.value.priority || "LOW",
      wishlistLink: form.value.wishlistLink || "",
      completed
    });

    resetForm();
    showForm.value = false;
    return;
  }

  await addNikahItem({
    ...form.value,
    price: Number(form.value.price || 0),
    completed,
    files: []
  });

  resetForm();
};

const toggleCompleted = async (item: NikahItem) => {
  if (!item.id) return;

  const newCompleted = !isCompleted(item);

  await updateNikahItem(item.id, {
    completed: newCompleted,
    progress: newCompleted ? "DONE" : "NOT YET"
  });
};

const startEdit = (item: NikahItem) => {
  editId.value = item.id || null;
  showForm.value = true;

  // The form sits above the list, so bring it into view when editing from far down.
  nextTick(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formEl.value?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });

  form.value = {
    category: item.category,
    name: item.name,
    price: Number(item.price || 0),
    vendor: item.vendor || "",
    details: item.details || "",
    progress: item.progress,
    priority: item.priority || "LOW",
    wishlistLink: item.wishlistLink || "",
    files: item.files || [],
    completed: isCompleted(item)
  };

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const cancelEdit = () => {
  resetForm();
  showForm.value = false;
};

const uploadFilesForItem = async (event: Event, item: NikahItem) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (!item.id || files.length === 0) return;

  const uploadedFiles: NikahFile[] = [];

  for (const file of files) {
    const uploaded = await uploadToCloudinary(file);

    uploadedFiles.push({
      url: uploaded.url,
      name: uploaded.name,
      type: uploaded.type
    });
  }

  const existingFiles = item.files || [];

  await updateNikahItem(item.id, {
    files: [...existingFiles, ...uploadedFiles]
  });

  target.value = "";
};

const removeFileFromItem = async (item: NikahItem, index: number) => {
  if (!item.id) return;

  const updatedFiles = [...(item.files || [])];
  updatedFiles.splice(index, 1);

  await updateNikahItem(item.id, {
    files: updatedFiles
  });
};

const removeItem = async (id: string) => {
  await deleteNikahItem(id);
};

const updateProgress = async (id: string, progress: string) => {
  await updateNikahItem(id, {
    progress,
    completed: progress === "DONE" || progress === "PAID"
  });
};

const isImage = (type: string) => {
  return type.startsWith("image/");
};

const imageFiles = (item: NikahItem) => {
  return (item.files || []).filter((file) => isImage(file.type));
};

const badgeClass = (progress: string) => {
  if (progress === "DONE") return "done";
  if (progress === "PAID") return "paid";
  if (progress === "BOOKED") return "booked";
  if (progress === "SURVEY") return "survey";
  return "not-yet";
};

const priorityClass = (priority: string) => {
  if (priority === "URGENT") return "urgent";
  if (priority === "HIGH") return "high";
  if (priority === "MEDIUM") return "medium";
  return "low";
};

const categoryIcons: Record<string, IconName> = {
  venue: "landmark",
  attire: "shirt",
  hantaran_aina: "gift",
  hantaran_akram: "gift",
  food: "utensils",
  decor: "flower",
  extra_services: "camera",
  extra_booth: "cake",
  doorgift: "gift",
  dulang_mas_kahwin: "gem"
};

const categoryIcon = (key: string): IconName => categoryIcons[key] ?? "sparkles";
</script>

<style scoped>
.planner {
  --ok: #1a7f37;
  display: grid;
  gap: 28px;
  min-width: 0;
}

@media (prefers-color-scheme: dark) {
  .planner {
    --ok: #30d158;
  }
}

.title-block {
  margin: 0 4px;
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

h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
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

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 0 4px 10px;
}

.section-head h2 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-head h2 :deep(.icon) {
  color: var(--ap-accent);
  font-size: 22px;
}

.meta {
  color: var(--ap-label-2);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

/* Summary */
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 16px;
}

.stat-label {
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.stat-value {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.stat-value small {
  margin-right: 4px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
}

/* Category tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  box-shadow: var(--ap-glass-edge);
  color: var(--ap-label);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s var(--ap-ease), transform 0.2s var(--ap-ease);
}

.tab :deep(.icon) {
  font-size: 18px;
  color: var(--ap-label-2);
}

.tab:hover {
  background: var(--ap-fill);
}

.tab:active {
  transform: scale(0.97);
}

.tab.active {
  background: var(--ap-accent);
  color: #fff;
  box-shadow: none;
}

.tab.active :deep(.icon) {
  color: #fff;
}

/* Form */
.form {
  padding: 16px 16px 6px;
}

#item-form {
  scroll-margin-top: 88px;
}

.toggle {
  color: var(--ap-accent);
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0 16px;
}

.field {
  margin-bottom: 14px;
  min-width: 0;
}

.field label,
.file-label {
  display: block;
  margin: 0 0 6px 4px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.field input,
.field select,
.field textarea,
.actions select,
.file-input {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 11px 14px;
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
.field textarea:focus,
.actions select:focus,
.file-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--ap-accent);
}

.field textarea {
  min-height: 88px;
  resize: vertical;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.btn {
  min-height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s var(--ap-ease), opacity 0.2s var(--ap-ease), background-color 0.2s var(--ap-ease);
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  flex: 1 1 200px;
  background: var(--ap-accent);
  color: #fff;
}

.btn.primary:hover {
  opacity: 0.92;
}

.btn.plain {
  background: var(--ap-fill);
  color: var(--ap-label);
}

.btn.plain:hover {
  background: var(--ap-separator);
}

.btn.danger {
  background: color-mix(in srgb, var(--ap-red) 12%, transparent);
  color: var(--ap-red);
}

.btn.danger:hover {
  background: color-mix(in srgb, var(--ap-red) 20%, transparent);
}

/* Items */
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
  padding: 16px;
}

.item + .item {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.item-main {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.item.completed .item-name {
  color: var(--ap-label-2);
  text-decoration: line-through;
}

.item-details {
  margin: 0;
  color: var(--ap-label-2);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.inline-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  margin-top: 4px;
  color: var(--ap-accent);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.inline-link:hover {
  text-decoration: underline;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  flex: none;
}

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--ap-fill);
  color: var(--ap-label-2);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.chip.survey,
.chip.planning,
.chip.medium {
  background: color-mix(in srgb, var(--ap-orange) 16%, transparent);
  color: var(--ap-orange);
}

.chip.booked,
.chip.low {
  background: color-mix(in srgb, var(--ap-blue) 13%, transparent);
  color: var(--ap-blue);
}

.chip.paid {
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
}

.chip.done {
  background: color-mix(in srgb, var(--ok) 15%, transparent);
  color: var(--ok);
}

.chip.high,
.chip.urgent {
  background: color-mix(in srgb, var(--ap-red) 14%, transparent);
  color: var(--ap-red);
}

.complete-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
}

.complete-row input {
  flex: none;
  width: 22px;
  height: 22px;
  margin: 0;
  accent-color: var(--ap-accent);
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  margin: 0;
}

.facts div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.facts dt {
  color: var(--ap-label-2);
  font-size: 13px;
}

.facts dd {
  margin: 0;
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.files {
  display: grid;
  gap: 8px;
}

.file-input {
  padding: 8px 10px;
  color: var(--ap-label-2);
  font-size: 14px;
}

.file-input::file-selector-button {
  min-height: 28px;
  margin-right: 12px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: var(--ap-fill);
  color: var(--ap-label);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.file-list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--ap-accent);
  font-size: 15px;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.file-link:hover {
  text-decoration: underline;
}

.btn.small {
  flex: none;
  padding: 0 14px;
  font-size: 15px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
}

.gallery img {
  display: block;
  width: 100%;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
}

.actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
}

@media (min-width: 560px) {
  .stats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .form-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .item {
    padding: 18px 20px;
  }
}

@media (max-width: 480px) {
  .item-top {
    flex-direction: column;
  }

  .chips {
    justify-content: flex-start;
  }

  .actions {
    grid-template-columns: 1fr 1fr;
  }

  .actions select {
    grid-column: 1 / -1;
  }
}
</style>

<template>
  <div>
    <header class="main-header">
      <h1>👰🏻‍♀️🤵🏻 Wedding Event Planner</h1>
      <p>Plan venue, booth, decor, doorgift and wedding day services ✨</p>
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

      <div class="summary-card">
        <span>Urgent</span>
        <h2>{{ urgentCount }}</h2>
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
      <h2>{{ editId ? "✏️ Edit Wedding Item" : "➕ Add Wedding Item" }}</h2>

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
          <label>Item Name</label>
          <input
            v-model="form.name"
            placeholder="Example: Venue, photobooth, doorgift"
          />
        </div>

        <div class="field">
          <label>Quantity</label>
          <input
            type="number"
            v-model.number="form.quantity"
            placeholder="Optional"
          />
        </div>

        <div class="field">
          <label>Price (RM)</label>
          <input
            type="number"
            v-model.number="form.price"
            placeholder="Example: 500"
          />
        </div>

        <div class="field">
          <label>Vendor</label>
          <input
            v-model="form.vendor"
            placeholder="Vendor name"
          />
        </div>

        <div class="field">
          <label>Progress</label>
          <select v-model="form.progress">
            <option value="NOT YET">NOT YET</option>
            <option value="SURVEY">SURVEY</option>
            <option value="BOOKED">BOOKED</option>
            <option value="PAID">PAID</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div class="field">
          <label>Priority</label>
          <select v-model="form.priority">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Wishlist / Inspiration Link</label>
        <input
          v-model="form.wishlistLink"
          placeholder="Shopee / TikTok / Instagram / Pinterest link"
        />
      </div>

      <div class="field">
        <label>Details</label>
        <textarea
          v-model="form.details"
          placeholder="Example: 500 pax, design theme, vendor notes"
        ></textarea>
      </div>

      <div class="form-actions">
        <button class="save-btn" @click="submitItem">
          {{ editId ? "Save Changes" : "+ Save Item" }}
        </button>

        <button
          v-if="editId"
          class="cancel-btn"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </div>

    <div class="category-section">
      <div class="section-header">
        <div>
          <h2>{{ currentCategory?.icon }} {{ currentCategory?.label }}</h2>
          <p>{{ filteredItems.length }} item(s)</p>
        </div>

        <div class="section-summary">
          <span>RM {{ selectedTotal.toFixed(2) }}</span>
          <span>{{ selectedCompletionPercent }}%</span>
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="empty">
        No item yet. Add one above ✨
      </div>

      <div class="item-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
        >
          <div class="item-top">
            <div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.details || "No details yet" }}</p>

              <a
                v-if="item.wishlistLink"
                :href="item.wishlistLink"
                target="_blank"
                class="wish-link"
              >
                🔗 Open Wishlist / Inspiration
              </a>
            </div>

            <div class="badges">
              <span class="badge" :class="badgeClass(item.progress)">
                {{ item.progress }}
              </span>

              <span class="priority" :class="priorityClass(item.priority || 'LOW')">
                {{ item.priority || "LOW" }}
              </span>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <span>Price</span>
              <strong>RM {{ Number(item.price || 0).toFixed(2) }}</strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>{{ item.quantity || "-" }}</strong>
            </div>

            <div>
              <span>Vendor</span>
              <strong>{{ item.vendor || "-" }}</strong>
            </div>
          </div>

          <div class="file-section">
            <label>Upload inspiration / receipt / picture</label>

            <input
              type="file"
              multiple
              @change="uploadFilesForItem($event, item)"
            />

            <div
              v-if="item.files && item.files.length > 0"
              class="file-list"
            >
              <div
                v-for="(file, index) in item.files"
                :key="file.url"
                class="file-row"
              >
                <div>
                  <a
                    :href="file.url"
                    target="_blank"
                    class="file-link"
                  >
                    {{ isImage(file.type) ? "🖼️" : "📎" }}
                    {{ file.name }}
                  </a>

                  <img
                    v-if="isImage(file.type)"
                    :src="file.url"
                    class="preview"
                  />
                </div>

                <button
                  class="remove-file-btn"
                  @click="removeFileFromItem(item, index)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="imageFiles(item).length > 0"
            class="gallery"
          >
            <h4>🖼 Inspiration Gallery</h4>

            <div class="gallery-grid">
              <a
                v-for="file in imageFiles(item)"
                :key="file.url"
                :href="file.url"
                target="_blank"
              >
                <img :src="file.url" />
              </a>
            </div>
          </div>

          <div class="actions">
            <select
              :value="item.progress"
              @change="updateProgress(item.id!, ($event.target as HTMLSelectElement).value)"
            >
              <option value="NOT YET">NOT YET</option>
              <option value="SURVEY">SURVEY</option>
              <option value="BOOKED">BOOKED</option>
              <option value="PAID">PAID</option>
              <option value="DONE">DONE</option>
            </select>

            <button class="edit-btn" @click="startEdit(item)">
              Edit
            </button>

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
  addWeddingItem,
  listenWeddingItems,
  deleteWeddingItem,
  updateWeddingItem
} from "@/services/weddingService";

import { uploadToCloudinary } from "@/services/uploadService";

import type {
  WeddingEventItem,
  WeddingFile
} from "@/types/wedding";

const categories = [
  { key: "venue", label: "Venue Suggestion", icon: "🏛️" },
  { key: "attire", label: "Attire", icon: "👗" },
  { key: "extra_booth", label: "Extra Booth", icon: "🍰" },
  { key: "decor", label: "Decor", icon: "🌸" },
  { key: "extra_services", label: "Extra Services", icon: "📸" },
  { key: "doorgift", label: "Doorgift", icon: "🎁" }
];

const selectedCategory = ref("venue");
const items = ref<WeddingEventItem[]>([]);
const editId = ref<string | null>(null);

const form = ref<WeddingEventItem>({
  category: "venue",
  name: "",
  quantity: undefined,
  price: 0,
  vendor: "",
  details: "",
  progress: "NOT YET",
  priority: "LOW",
  wishlistLink: "",
  files: []
});

onMounted(() => {
  listenWeddingItems((data) => {
    items.value = data;
  });
});

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
  items.value.filter(
    (item) => item.progress === "DONE" || item.progress === "PAID"
  ).length
);

const urgentCount = computed(() =>
  items.value.filter((item) => item.priority === "URGENT").length
);

const selectedCompletedCount = computed(() =>
  filteredItems.value.filter(
    (item) => item.progress === "DONE" || item.progress === "PAID"
  ).length
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
    quantity: undefined,
    price: 0,
    vendor: "",
    details: "",
    progress: "NOT YET",
    priority: "LOW",
    wishlistLink: "",
    files: []
  };

  editId.value = null;
};

const submitItem = async () => {
  if (!form.value.name.trim()) return;

  if (editId.value) {
    await updateWeddingItem(editId.value, {
      category: form.value.category,
      name: form.value.name,
      quantity: form.value.quantity || undefined,
      price: Number(form.value.price || 0),
      vendor: form.value.vendor || "",
      details: form.value.details || "",
      progress: form.value.progress,
      priority: form.value.priority || "LOW",
      wishlistLink: form.value.wishlistLink || ""
    });

    resetForm();
    return;
  }

  await addWeddingItem({
    ...form.value,
    quantity: form.value.quantity || undefined,
    price: Number(form.value.price || 0),
    files: []
  });

  resetForm();
};

const startEdit = (item: WeddingEventItem) => {
  editId.value = item.id || null;

  form.value = {
    category: item.category,
    name: item.name,
    quantity: item.quantity || undefined,
    price: Number(item.price || 0),
    vendor: item.vendor || "",
    details: item.details || "",
    progress: item.progress,
    priority: item.priority || "LOW",
    wishlistLink: item.wishlistLink || "",
    files: item.files || []
  };

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const cancelEdit = () => {
  resetForm();
};

const uploadFilesForItem = async (
  event: Event,
  item: WeddingEventItem
) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (!item.id || files.length === 0) return;

  const uploadedFiles: WeddingFile[] = [];

  for (const file of files) {
    const uploaded = await uploadToCloudinary(file);

    uploadedFiles.push({
      url: uploaded.url,
      name: uploaded.name,
      type: uploaded.type
    });
  }

  const existingFiles = item.files || [];

  await updateWeddingItem(item.id, {
    files: [...existingFiles, ...uploadedFiles]
  });

  target.value = "";
};

const removeFileFromItem = async (
  item: WeddingEventItem,
  index: number
) => {
  if (!item.id) return;

  const updatedFiles = [...(item.files || [])];

  updatedFiles.splice(index, 1);

  await updateWeddingItem(item.id, {
    files: updatedFiles
  });
};

const removeItem = async (id: string) => {
  await deleteWeddingItem(id);
};

const updateProgress = async (
  id: string,
  progress: string
) => {
  await updateWeddingItem(id, { progress });
};

const isImage = (type: string) => {
  return type.startsWith("image/");
};

const imageFiles = (item: WeddingEventItem) => {
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
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 28px;
}

.summary-card,
.form-card,
.category-section {
  background: white;
  padding: 26px;
  border-radius: 26px;
  margin-bottom: 28px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.05);
}

.summary-card span {
  color: #777;
  font-size: 13px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.field {
  margin-bottom: 16px;
}

.field label,
.file-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
}

.field input,
.field select,
.field textarea,
.actions select,
.file-section input {
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

.form-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.save-btn,
.cancel-btn,
.edit-btn,
.delete-btn,
.remove-file-btn {
  border: none;
  cursor: pointer;
  font-weight: 800;
}

.save-btn {
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
  color: white;
}

.cancel-btn {
  padding: 14px 18px;
  border-radius: 14px;
  background: #eee;
  color: #555;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-summary {
  display: flex;
  gap: 10px;
}

.section-summary span {
  font-weight: 800;
  background: #f5f5f5;
  padding: 10px 14px;
  border-radius: 999px;
}

.empty {
  padding: 24px;
  border-radius: 20px;
  background: #fff7fb;
  color: #777;
}

.item-grid {
  margin-top: 18px;
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

.wish-link {
  display: inline-block;
  margin-top: 10px;
  color: #d63384;
  font-weight: 800;
  text-decoration: none;
}

.badges {
  display: grid;
  gap: 8px;
  justify-items: end;
}

.badge,
.priority {
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

.survey {
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

.low {
  background: #eef6ff;
  color: #2f6cd6;
}

.medium {
  background: #fff2c7;
  color: #9a6a00;
}

.high {
  background: #ffe3e3;
  color: #d33;
}

.urgent {
  background: #d63384;
  color: white;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.info-grid div {
  background: white;
  padding: 14px;
  border-radius: 14px;
}

.info-grid span {
  display: block;
  color: #777;
  font-size: 12px;
  margin-bottom: 5px;
}

.file-section {
  margin: 16px 0;
  background: white;
  padding: 14px;
  border-radius: 16px;
}

.file-list {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.file-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  background: #fff7fb;
  padding: 12px;
  border-radius: 14px;
}

.file-link {
  color: #d63384;
  font-weight: 700;
  text-decoration: none;
  word-break: break-word;
}

.preview {
  display: block;
  margin-top: 10px;
  max-width: 120px;
  border-radius: 12px;
}

.remove-file-btn {
  padding: 8px 12px;
  border-radius: 12px;
  background: #ffe3e3;
  color: #d33;
}

.gallery {
  background: white;
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.gallery h4 {
  margin-top: 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
}

.gallery-grid img {
  width: 100%;
  height: 95px;
  object-fit: cover;
  border-radius: 12px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  margin-top: 16px;
}

.edit-btn {
  padding: 12px 16px;
  border-radius: 14px;
  background: #e6f0ff;
  color: #2f6cd6;
}

.delete-btn {
  padding: 12px 16px;
  border-radius: 14px;
  background: #ffe3e3;
  color: #d33;
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
  .info-grid {
    grid-template-columns: 1fr;
  }

  .summary-card,
  .form-card,
  .category-section {
    padding: 20px;
    border-radius: 22px;
  }

  .section-header,
  .item-top,
  .file-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .badges {
    justify-items: start;
  }

  .actions,
  .form-actions {
    grid-template-columns: 1fr;
  }
}
</style>
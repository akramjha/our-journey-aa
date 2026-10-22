<template>
  <div class="overlay" @click.self="emit('close')">
    <form
      ref="sheetEl"
      class="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pb-title"
      novalidate
      @submit.prevent="submit"
    >
      <div class="sheet-header">
        <div>
          <h2 id="pb-title">Add a photobooth strip</h2>
          <p>It joins your memories right away.</p>
        </div>

        <button type="button" class="close-btn" aria-label="Close" @click="emit('close')">
          <AppIcon name="x" />
        </button>
      </div>

      <div class="field">
        <label for="pb-file">Photo</label>
        <label class="picker" :class="{ filled: preview }" for="pb-file">
          <img v-if="preview" :src="preview" alt="Selected photo preview" />
          <span v-else><AppIcon name="image" /> Choose a photo</span>
        </label>
        <input id="pb-file" class="file" type="file" accept="image/*" @change="onFile" />
      </div>

      <div class="field">
        <label for="pb-month">Month</label>
        <input id="pb-month" v-model="month" type="month" />
      </div>

      <div class="field">
        <label for="pb-caption">Caption</label>
        <input
          id="pb-caption"
          v-model="caption"
          maxlength="80"
          placeholder="Optional. Example: Still choosing you"
        />
      </div>

      <p v-if="error" class="form-error" role="alert">{{ error }}</p>

      <button type="submit" class="save-btn" :disabled="saving">
        {{ saving ? "Uploading…" : "Add to memories" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { uploadToCloudinary } from "@/services/uploadService";
import { addPhotoboothMemory } from "@/services/photoboothService";

const emit = defineEmits<{ close: []; saved: [] }>();

const MAX_BYTES = 10 * 1024 * 1024;

const sheetEl = ref<HTMLElement | null>(null);
const file = ref<File | null>(null);
const preview = ref("");
const caption = ref("");
const saving = ref(false);
const error = ref("");

const now = new Date();
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

const onFile = (event: Event) => {
  const picked = (event.target as HTMLInputElement).files?.[0] ?? null;
  error.value = "";

  if (preview.value) URL.revokeObjectURL(preview.value);
  preview.value = "";
  file.value = null;

  if (!picked) return;

  if (!picked.type.startsWith("image/")) {
    error.value = "Choose an image file.";
    return;
  }

  if (picked.size > MAX_BYTES) {
    error.value = "That photo is over 10 MB. Choose a smaller one.";
    return;
  }

  file.value = picked;
  preview.value = URL.createObjectURL(picked);
};

const submit = async () => {
  if (saving.value) return;

  if (!file.value) {
    error.value = "Choose a photo to add.";
    return;
  }

  if (!month.value) {
    error.value = "Pick the month this was taken.";
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const uploaded = await uploadToCloudinary(file.value);
    await addPhotoboothMemory({
      month: month.value,
      caption: caption.value.trim(),
      url: uploaded.url
    });
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Photobooth upload failed:", err);
    error.value = "Couldn't upload that photo. Check your connection and try again.";
  } finally {
    saving.value = false;
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") emit("close");
};

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  document.body.style.overflow = "hidden";
  await nextTick();
  sheetEl.value?.querySelector<HTMLElement>("#pb-file")?.focus();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
  if (preview.value) URL.revokeObjectURL(preview.value);
});
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
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
  background: none;
  color: var(--ap-label-2);
  font-size: 18px;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--ap-fill);
}

.field {
  margin-bottom: 14px;
}

.field > label:not(.picker) {
  display: block;
  margin: 0 0 6px 4px;
  color: var(--ap-label-2);
  font-size: 13px;
  font-weight: 500;
}

.field input:not(.file) {
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

.field input::placeholder {
  color: var(--ap-label-2);
  opacity: 0.8;
}

.field input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--ap-accent);
}

/* The native file input stays in the tab order, visually replaced by the picker. */
.file {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.picker {
  display: grid;
  place-items: center;
  min-height: 140px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--ap-surface-2);
  color: var(--ap-label-2);
  font-size: 15px;
  cursor: pointer;
  transition: box-shadow 0.2s var(--ap-ease);
}

.picker span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.picker :deep(.icon) {
  font-size: 20px;
}

.picker img {
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: cover;
}

.field:focus-within .picker {
  box-shadow: 0 0 0 2px var(--ap-accent);
}

.form-error {
  margin: 0 4px 12px;
  color: var(--ap-red);
  font-size: 14px;
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

.save-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.save-btn:disabled {
  opacity: 0.55;
  cursor: progress;
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

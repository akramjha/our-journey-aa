<template>
  <section
    class="memories"
    aria-labelledby="memories-title"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <div class="section-head">
      <h2 id="memories-title">Photobooth memories</h2>
      <button type="button" class="add-btn" @click="showUpload = true">
        <AppIcon name="plus" />
        <span>Add photo</span>
      </button>
    </div>

    <figure class="frame" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <Transition name="fade" mode="out-in">
        <button
          v-if="!failed.has(currentMemory.image)"
          :key="currentMemory.image"
          ref="photoBtn"
          type="button"
          class="photo-btn"
          aria-label="View photo larger"
          @click="openLightbox"
        >
          <img
            class="photo"
            :src="currentMemory.image"
            :alt="`Photobooth strip, ${currentMemory.month}`"
            @error="failed.add(currentMemory.image)"
          />
        </button>
        <div v-else :key="`empty-${currentMemory.image}`" class="photo placeholder">
          Photo coming soon
        </div>
      </Transition>

      <figcaption class="caption">
        <div class="caption-text">
          <span class="month">{{ currentMemory.month }}</span>
          <span v-if="currentMemory.caption" class="note">{{ currentMemory.caption }}</span>
        </div>

        <div class="controls">
          <button class="step" aria-label="Previous memory" @click="stepBy(prevMemory)">
            <AppIcon name="chevron-left" />
          </button>
          <button class="step" aria-label="Next memory" @click="stepBy(nextMemory)">
            <AppIcon name="chevron-right" />
          </button>
        </div>
      </figcaption>
    </figure>

    <div v-if="memories.length <= MAX_DOTS" class="dots" role="group" aria-label="Choose memory">
      <button
        v-for="(memory, index) in memories"
        :key="memory.image"
        class="dot"
        :class="{ active: selectedIndex === index }"
        :aria-current="selectedIndex === index ? 'true' : undefined"
        :aria-label="memory.month"
        @click="go(index)"
      ></button>
    </div>
    <p v-else class="position" aria-live="polite">{{ selectedIndex + 1 }} of {{ memories.length }}</p>

    <Transition name="fade">
      <div
        v-if="lightbox"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`${currentMemory.month} photo`"
        @click.self="closeLightbox"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <button ref="closeBtn" type="button" class="lb-close" aria-label="Close" @click="closeLightbox">
          <AppIcon name="x" />
        </button>

        <button type="button" class="lb-step prev" aria-label="Previous memory" @click="stepBy(prevMemory)">
          <AppIcon name="chevron-left" />
        </button>

        <figure class="lb-figure">
          <img :src="currentMemory.image" :alt="`Photobooth strip, ${currentMemory.month}`" />
          <figcaption>
            <strong>{{ currentMemory.month }}</strong>
            <span v-if="currentMemory.caption">{{ currentMemory.caption }}</span>
          </figcaption>

          <div v-if="currentMemory.id" class="lb-actions">
            <template v-if="!confirmingDelete">
              <button type="button" class="lb-remove" @click="confirmingDelete = true">
                Remove photo
              </button>
            </template>
            <template v-else>
              <span class="lb-confirm">Remove this photo from your memories?</span>
              <button type="button" class="lb-remove danger" :disabled="deleting" @click="removeCurrent">
                {{ deleting ? "Removing…" : "Remove" }}
              </button>
              <button type="button" class="lb-remove" :disabled="deleting" @click="confirmingDelete = false">
                Keep
              </button>
            </template>
            <p v-if="deleteError" class="lb-error" role="alert">{{ deleteError }}</p>
          </div>
        </figure>

        <button type="button" class="lb-step next" aria-label="Next memory" @click="stepBy(nextMemory)">
          <AppIcon name="chevron-right" />
        </button>
      </div>
    </Transition>

    <PhotoboothUpload v-if="showUpload" @close="closeUpload" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import PhotoboothUpload from "@/components/dashboard/PhotoboothUpload.vue";
import { listenPhotoboothMemories, deletePhotoboothMemory } from "@/services/photoboothService";
import type { PhotoboothMemory } from "@/services/photoboothService";

interface Memory {
  /** Set for uploaded strips only; the built-in starters can't be removed. */
  id?: string;
  /** "YYYY-MM", newest sorts first. */
  sortKey: string;
  month: string;
  image: string;
  caption: string;
}

const MAX_DOTS = 8;

const selectedIndex = ref(0);
const failed = reactive(new Set<string>());
const lightbox = ref(false);
const showUpload = ref(false);
const photoBtn = ref<HTMLButtonElement | null>(null);
const closeBtn = ref<HTMLButtonElement | null>(null);

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return y && m
    ? new Date(y, m - 1, 1).toLocaleDateString("en-MY", { month: "long", year: "numeric" })
    : key;
};

const starters: Memory[] = [
  {
    sortKey: "2025-01",
    month: "January 2025",
    image: "/photos/jan2025-1.jpg",
    caption: "The beginning of our little photobooth tradition"
  },
  {
    sortKey: "2025-02",
    month: "February 2025",
    image: "/photos/feb2025-1.jpg",
    caption: "Another month, another memory with you"
  },
  {
    sortKey: "2025-03",
    month: "March 2025",
    image: "/photos/mar2025-1.jpg",
    caption: "Still choosing you, every month"
  }
];

const uploaded = ref<PhotoboothMemory[]>([]);
let unsubscribe: (() => void) | null = null;

// Uploaded strips join the starters, newest month first. Photos that fail to load
// drop out so the carousel never opens on a gap; the placeholder only shows if all fail.
const memories = computed<Memory[]>(() => {
  const all = [
    ...uploaded.value.map((m) => ({
      id: m.id,
      sortKey: m.month,
      month: monthLabel(m.month),
      image: m.url,
      caption: m.caption
    })),
    ...starters
  ].sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  const visible = all.filter((m) => !failed.has(m.image));
  return visible.length ? visible : all;
});

// Keep the selection valid as the list grows or shrinks.
watch(
  () => memories.value.length,
  (length) => {
    if (selectedIndex.value >= length) selectedIndex.value = Math.max(0, length - 1);
  }
);

const currentMemory = computed(() => memories.value[selectedIndex.value] ?? memories.value[0]);

const confirmingDelete = ref(false);
const deleting = ref(false);
const deleteError = ref("");

// Moving to another photo cancels a pending removal.
watch(
  () => currentMemory.value.image,
  () => {
    confirmingDelete.value = false;
    deleteError.value = "";
  }
);

const removeCurrent = async () => {
  const id = currentMemory.value.id;
  if (!id || deleting.value) return;

  deleting.value = true;
  deleteError.value = "";

  try {
    await deletePhotoboothMemory(id);
    confirmingDelete.value = false;
  } catch (err) {
    console.error("Failed to remove photo:", err);
    deleteError.value = "Couldn't remove that photo. Try again.";
  } finally {
    deleting.value = false;
  }
};

const nextMemory = () => {
  selectedIndex.value = (selectedIndex.value + 1) % memories.value.length;
};

const prevMemory = () => {
  selectedIndex.value =
    (selectedIndex.value - 1 + memories.value.length) % memories.value.length;
};

// Auto-advance only for people who haven't asked for reduced motion, and
// pause while the carousel is hovered, focused, or open full screen.
let interval: number | undefined;
let paused = false;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const startAutoplay = () => {
  stopAutoplay();
  if (reducedMotion.matches) return;
  interval = window.setInterval(() => {
    if (!paused && !lightbox.value && !showUpload.value) nextMemory();
  }, 6000);
};

const stopAutoplay = () => {
  if (interval !== undefined) clearInterval(interval);
  interval = undefined;
};

const pause = () => (paused = true);
const resume = () => (paused = false);

const go = (index: number) => {
  selectedIndex.value = index;
  startAutoplay();
};

const stepBy = (step: () => void) => {
  step();
  startAutoplay();
};

// Swipe left/right on the photo or lightbox to move between memories.
let touchX = 0;
let touchY = 0;

const onTouchStart = (event: TouchEvent) => {
  touchX = event.changedTouches[0].clientX;
  touchY = event.changedTouches[0].clientY;
};

const onTouchEnd = (event: TouchEvent) => {
  const dx = event.changedTouches[0].clientX - touchX;
  const dy = event.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  stepBy(dx < 0 ? nextMemory : prevMemory);
};

const openLightbox = async () => {
  lightbox.value = true;
  document.body.style.overflow = "hidden";
  await nextTick();
  closeBtn.value?.focus();
};

const closeLightbox = () => {
  lightbox.value = false;
  document.body.style.overflow = "";
  nextTick(() => photoBtn.value?.focus());
};

const closeUpload = () => (showUpload.value = false);

// A fresh upload sorts into place; jump to it so the result is visible.
const onSaved = () => {
  selectedIndex.value = 0;
  startAutoplay();
};

const onKeydown = (event: KeyboardEvent) => {
  if (!lightbox.value) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") stepBy(nextMemory);
  if (event.key === "ArrowLeft") stepBy(prevMemory);
};

onMounted(() => {
  startAutoplay();
  window.addEventListener("keydown", onKeydown);
  unsubscribe = listenPhotoboothMemories((items) => (uploaded.value = items));
});

onUnmounted(() => {
  stopAutoplay();
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
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

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  margin: -6px -4px -6px 0;
  padding: 0 8px;
  border: 0;
  background: none;
  color: var(--ap-accent);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.add-btn:hover {
  opacity: 0.8;
}

.add-btn :deep(.icon) {
  font-size: 18px;
}

.frame {
  margin: 0;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  border-radius: var(--ap-radius);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
  overflow: hidden;
}

.photo-btn {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.photo {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: center 35%;
}

.placeholder {
  display: grid;
  place-items: center;
  background: var(--ap-surface-2);
  color: var(--ap-label-2);
  font-size: 15px;
}

.caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.caption-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.month {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.note {
  color: var(--ap-label-2);
  font-size: 14px;
  line-height: 1.4;
}

.controls {
  display: flex;
  gap: 8px;
  flex: none;
}

.step {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--ap-fill);
  color: var(--ap-label);
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s var(--ap-ease), background-color 0.2s var(--ap-ease);
}

.step:hover {
  background: var(--ap-separator);
}

.step:active {
  transform: scale(0.92);
}

.dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.dot {
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.dot::after {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: var(--ap-separator);
  transition: background-color 0.25s var(--ap-ease), transform 0.25s var(--ap-ease);
}

.dot.active::after {
  background: var(--ap-label);
  transform: scale(1.1);
}

.position {
  margin: 12px 0 0;
  text-align: center;
  color: var(--ap-label-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.86);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  color: #fff;
  font-family: var(--ap-font);
}

.lb-figure {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin: 0;
  min-width: 0;
}

.lb-figure img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 220px);
  border-radius: 14px;
  object-fit: contain;
}

.lb-figure figcaption {
  display: grid;
  gap: 2px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.72);
}

.lb-figure strong {
  color: #fff;
  font-size: 17px;
  font-weight: 600;
}

.lb-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 12px;
}

.lb-confirm {
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
}

.lb-remove {
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s var(--ap-ease);
}

.lb-remove:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
}

.lb-remove.danger {
  background: #d70015;
}

.lb-remove.danger:hover:not(:disabled) {
  background: #b80012;
}

.lb-remove:disabled {
  opacity: 0.6;
  cursor: progress;
}

.lb-remove:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.lb-error {
  margin: 0;
  flex-basis: 100%;
  text-align: center;
  color: #ff8a8a;
  font-size: 14px;
}

.lb-close,
.lb-step {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s var(--ap-ease), transform 0.2s var(--ap-ease);
}

.lb-close:hover,
.lb-step:hover {
  background: rgba(255, 255, 255, 0.24);
}

.lb-close:active,
.lb-step:active {
  transform: scale(0.92);
}

.lb-close {
  position: absolute;
  top: max(16px, env(safe-area-inset-top));
  right: 16px;
  z-index: 1;
}

.lb-close:focus-visible,
.lb-step:focus-visible,
.photo-btn:focus-visible,
.add-btn:focus-visible,
.step:focus-visible,
.dot:focus-visible {
  outline: 2px solid var(--ap-accent);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .lightbox {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Swipe moves between photos on phones; the arrows move out of the way to the bottom. */
  .lb-step {
    position: absolute;
    bottom: max(16px, env(safe-area-inset-bottom));
  }

  .lb-step.prev {
    left: 16px;
  }

  .lb-step.next {
    right: 16px;
  }

  .lb-figure img {
    max-height: calc(100vh - 280px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s var(--ap-ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

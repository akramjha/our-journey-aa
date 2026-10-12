<template>
  <section class="memories" aria-labelledby="memories-title">
    <div class="section-head">
      <h2 id="memories-title">Photobooth memories</h2>
    </div>

    <figure class="frame">
      <Transition name="fade" mode="out-in">
        <img
          v-if="!failed.has(selectedIndex)"
          :key="selectedIndex"
          class="photo"
          :src="currentMemory.image"
          :alt="`Photobooth strip, ${currentMemory.month}`"
          @error="failed.add(selectedIndex)"
        />
        <div v-else :key="`empty-${selectedIndex}`" class="photo placeholder">
          Photo coming soon
        </div>
      </Transition>

      <figcaption class="caption">
        <div class="caption-text">
          <span class="month">{{ currentMemory.month }}</span>
          <span class="note">{{ currentMemory.caption }}</span>
        </div>

        <div class="controls">
          <button class="step" aria-label="Previous memory" @click="prevMemory">
            <AppIcon name="chevron-left" />
          </button>
          <button class="step" aria-label="Next memory" @click="nextMemory">
            <AppIcon name="chevron-right" />
          </button>
        </div>
      </figcaption>
    </figure>

    <div class="dots" role="tablist" aria-label="Choose memory">
      <button
        v-for="(memory, index) in memories"
        :key="memory.month"
        role="tab"
        class="dot"
        :class="{ active: selectedIndex === index }"
        :aria-selected="selectedIndex === index"
        :aria-label="memory.month"
        @click="selectedIndex = index"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

const selectedIndex = ref(0);
const failed = reactive(new Set<number>());

const memories = [
  {
    month: "January 2025",
    image: "/photos/jan2025-1.jpg",
    caption: "The beginning of our little photobooth tradition"
  },

  {
    month: "February 2025",
    image: "/photos/feb2025-1.jpg",
    caption: "Another month, another memory with you"
  },

  {
    month: "March 2025",
    image: "/photos/mar2025-1.jpg",
    caption: "Still choosing you, every month"
  }
];

const currentMemory = computed(() => memories[selectedIndex.value]);

const nextMemory = () => {
  selectedIndex.value =
    (selectedIndex.value + 1) % memories.length;
};

const prevMemory = () => {
  selectedIndex.value =
    (selectedIndex.value - 1 + memories.length) %
    memories.length;
};

let interval: number;

onMounted(() => {
  interval = window.setInterval(() => {
    nextMemory();
  }, 6000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.section-head {
  padding: 0 4px 10px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
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
  width: 36px;
  height: 36px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s var(--ap-ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

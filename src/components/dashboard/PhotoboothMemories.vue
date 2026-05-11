<template>
  <section class="memory-card">
    <div class="memory-left">
      <div class="memory-header">
        <span class="eyebrow">📸 Memory Highlight</span>

        <h2>Our Photobooth Memories</h2>

        <p>Small moments, big feelings 💖</p>
      </div>

      <div class="memory-info">
        <h3>{{ currentMemory.month }}</h3>

        <p>{{ currentMemory.caption }}</p>
      </div>

      <div class="memory-actions">
        <button @click="prevMemory">‹</button>

        <div class="dots">
          <span
            v-for="(_, index) in memories"
            :key="index"
            :class="{ active: selectedIndex === index }"
            @click="selectedIndex = index"
          ></span>
        </div>

        <button @click="nextMemory">›</button>
      </div>
    </div>

    <div class="memory-preview">
      <img
        :src="currentMemory.image"
        :alt="currentMemory.month"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const selectedIndex = ref(0);

const memories = [
  {
    month: "January 2025",
    image: "/photos/jan2025-1.jpg",
    caption: "The beginning of our little photobooth tradition 💕"
  },

  {
    month: "February 2025",
    image: "/photos/feb2025-1.jpg",
    caption: "Another month, another memory with you ❤️"
  },

  {
    month: "March 2025",
    image: "/photos/mar2025-1.jpg",
    caption: "Still choosing you, every month ✨"
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
  }, 5000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.memory-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: center;

  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);

  border-radius: 26px;
  padding: 22px;
  margin-bottom: 32px;

  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.04);

  border: 1px solid rgba(255, 182, 193, 0.18);
}

.eyebrow {
  display: inline-block;

  color: #d63384;

  font-weight: 900;
  font-size: 12px;

  margin-bottom: 8px;
}

.memory-header h2 {
  margin: 0;

  font-size: 24px;
  line-height: 1.2;

  color: #d63384;
}

.memory-header p {
  margin: 8px 0 0;

  color: #777;
  font-size: 14px;
}

.memory-info {
  margin-top: 22px;

  padding: 16px;

  border-radius: 18px;

  background: linear-gradient(
    135deg,
    #fff0f5,
    #eef6ff
  );
}

.memory-info h3 {
  margin: 0;

  font-size: 20px;
  font-weight: 800;
}

.memory-info p {
  margin-top: 8px;

  color: #666;

  font-size: 13px;
  line-height: 1.5;
}

.memory-actions {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-top: 18px;
}

.memory-actions button {
  width: 34px;
  height: 34px;

  border: none;
  border-radius: 999px;

  background: linear-gradient(
    135deg,
    #ff9a9e,
    #a0c4ff
  );

  color: white;

  font-size: 20px;
  font-weight: 800;

  cursor: pointer;

  transition: 0.25s ease;
}

.memory-actions button:hover {
  transform: scale(1.06);
}

.dots {
  display: flex;
  gap: 7px;
}

.dots span {
  width: 8px;
  height: 8px;

  border-radius: 999px;

  background: #ddd;

  cursor: pointer;

  transition: 0.25s ease;
}

.dots span.active {
  background: #d63384;

  transform: scale(1.12);
}

.memory-preview {
  width: 100%;
  max-width: 520px;
  height: 220px;

  justify-self: end;

  overflow: hidden;
  border-radius: 22px;

  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.memory-preview img {
  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center 35%;

  transition: 0.4s ease;
}

.memory-preview:hover img {
  transform: scale(1.03);
}

@media (max-width: 900px) {
  .memory-card {
    grid-template-columns: 1fr;
  }

  .memory-preview {
    max-width: 100%;
    height: 240px;

    justify-self: stretch;
  }
}

@media (max-width: 600px) {
  .memory-card {
    padding: 18px;
    border-radius: 22px;
  }

  .memory-header h2 {
    font-size: 22px;
  }

  .memory-header p {
    font-size: 13px;
  }

  .memory-info {
    padding: 14px;
  }

  .memory-info h3 {
    font-size: 18px;
  }

  .memory-preview {
    height: 220px;
  }
}
</style>
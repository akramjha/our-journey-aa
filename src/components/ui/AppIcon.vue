<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in paths[name]" :key="d" :d="d" />
  </svg>
</template>

<script setup lang="ts">
export type IconName =
  | "chevron-right"
  | "chevron-left"
  | "plus"
  | "x"
  | "sliders"
  | "calendar"
  | "checklist"
  | "coins"
  | "gem"
  | "book"
  | "sparkles"
  | "paperclip"
  | "landmark"
  | "shirt"
  | "gift"
  | "utensils"
  | "flower"
  | "camera"
  | "cake"
  | "link"
  | "image"
  | "home"
  | "heart"
  | "check";

defineProps<{ name: IconName }>();

const paths: Record<IconName, string[]> = {
  "chevron-right": ["m9 18 6-6-6-6"],
  "chevron-left": ["m15 18-6-6 6-6"],
  plus: ["M5 12h14", "M12 5v14"],
  x: ["M18 6 6 18", "m6 6 12 12"],
  sliders: [
    "M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3",
    "M1 14h6", "M9 8h6", "M17 16h6"
  ],
  calendar: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"],
  checklist: [
    "M9 4h6v3H9z",
    "M16 5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2",
    "m9 14 2 2 4-4"
  ],
  coins: [
    "M8 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z",
    "M18.09 10.37A6 6 0 1 1 10.34 18",
    "M7 6h1v4"
  ],
  gem: ["M6 3h12l4 6-10 13L2 9Z", "M11 3 8 9l4 13 4-13-3-6", "M2 9h20"],
  book: [
    "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",
    "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
  ],
  paperclip: [
    "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
  ],
  sparkles: [
    "M9.9 15.5A2 2 0 0 0 8.5 14.1l-6.1-1.6a.5.5 0 0 1 0-1l6.1-1.6A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0l1.6 6.1a2 2 0 0 0 1.4 1.4l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.6a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z"
  ],
  landmark: ["M3 22h18", "M6 18v-7", "M10 18v-7", "M14 18v-7", "M18 18v-7", "m12 2 9 5H3z", "M3 18h18"],
  shirt: ["M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"],
  gift: ["M20 12v10H4V12", "M2 7h20v5H2z", "M12 22V7", "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"],
  utensils: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", "M7 2v20", "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"],
  flower: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M12 9V6.5a2.5 2.5 0 1 1 2.5 2.5", "M15 12h2.5a2.5 2.5 0 1 1-2.5 2.5", "M12 15v2.5a2.5 2.5 0 1 1-2.5-2.5", "M9 12H6.5A2.5 2.5 0 1 1 9 9.5"],
  camera: ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  cake: ["M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8", "M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1", "M2 21h20", "M7 8v3", "M12 8v3", "M17 8v3", "M7 4h.01", "M12 4h.01", "M17 4h.01"],
  link: ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  home: ["m3 10 9-7 9 7", "M5 9v11h14V9", "M10 20v-6h4v6"],
  check: ["M20 6 9 17l-5-5"],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
  image: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"]
};
</script>

<style scoped>
.icon {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>

import { ref } from "vue";

export type ThemeChoice = "system" | "light" | "dark";

const KEY = "our-journey-theme";
const BAR_COLORS = { light: "#f2f2f7", dark: "#000000" };

// Stored per device, so a failing or blocked localStorage just means "follow the system".
const read = (): ThemeChoice => {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
};

export const theme = ref<ThemeChoice>(read());

export const applyTheme = (choice: ThemeChoice) => {
  const root = document.documentElement;

  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);

  // Keep the browser / installed-app bar in step with a forced theme.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.dataset.original ??= meta.content;
    meta.content = choice === "system" ? meta.dataset.original : BAR_COLORS[choice];
  });
};

export const setTheme = (choice: ThemeChoice) => {
  theme.value = choice;

  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* preference simply won't persist */
  }

  applyTheme(choice);
};

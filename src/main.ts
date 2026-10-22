import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/apple.css";
import { applyTheme, theme } from "./composables/useTheme";

applyTheme(theme.value);

createApp(App).use(router).mount("#app");

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

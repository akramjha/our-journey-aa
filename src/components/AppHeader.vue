<template>
  <header class="navbar">
    <RouterLink to="/" class="brand">Our Journey</RouterLink>

    <nav class="nav-links" aria-label="Main">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-btn">
        {{ link.label }}
      </RouterLink>
    </nav>
  </header>

  <!-- Sibling of the header: a fixed child of the blurred navbar would be clipped to it. -->
  <nav class="tabbar" aria-label="Main">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab"
      :exact-active-class="tab.to === '/' ? 'is-active' : undefined"
      :active-class="tab.to === '/' ? undefined : 'is-active'"
    >
      <AppIcon :name="tab.icon" />
      <span>{{ tab.short }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import type { IconName } from "@/components/ui/AppIcon.vue";

const tabs: { to: string; label: string; short: string; icon: IconName }[] = [
  { to: "/", label: "Home", short: "Home", icon: "home" },
  { to: "/savings", label: "Gold Savings", short: "Gold", icon: "coins" },
  { to: "/checklist", label: "Checklist", short: "Checklist", icon: "checklist" },
  { to: "/tunang", label: "Tunang", short: "Tunang", icon: "gem" },
  { to: "/nikah", label: "Nikah", short: "Nikah", icon: "book" },
  { to: "/wedding", label: "Wedding", short: "Wedding", icon: "sparkles" }
];

// The brand already links home, so the desktop bar omits a duplicate Home link.
const links = tabs.slice(1);
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 10px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 8px 8px 20px;
  margin-bottom: 32px;
  background: var(--ap-bar);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  border-radius: 16px;
  box-shadow: var(--ap-glass-edge), 0 6px 20px rgba(20, 20, 50, 0.08);
  font-family: var(--ap-font);
}

.brand {
  flex: none;
  color: var(--ap-label);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2px;
}

.nav-btn {
  flex: none;
  padding: 11px 14px;
  border-radius: 10px;
  color: var(--ap-label-2);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s var(--ap-ease), color 0.2s var(--ap-ease);
}

.nav-btn:hover {
  background: var(--ap-fill);
  color: var(--ap-label);
}

.nav-btn.router-link-active {
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
  font-weight: 600;
}

.brand:focus-visible,
.nav-btn:focus-visible,
.tab:focus-visible {
  outline: 2px solid var(--ap-accent);
  outline-offset: 2px;
}

/* Bottom tab bar: phones only */
.tabbar {
  display: none;
}

@media (max-width: 719px) {
  .navbar {
    top: 8px;
    padding: 12px 20px;
    margin-bottom: 20px;
  }

  .nav-links {
    display: none;
  }

  .tabbar {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: max(10px, env(safe-area-inset-bottom));
    z-index: 60;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    padding: 4px;
    background: var(--ap-bar);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    backdrop-filter: saturate(180%) blur(24px);
    border-radius: 22px;
    box-shadow: var(--ap-glass-edge), 0 8px 28px rgba(20, 20, 50, 0.14);
    font-family: var(--ap-font);
  }

  .tab {
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: 8px 0 7px;
    border-radius: 18px;
    color: var(--ap-label-2);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0;
    text-decoration: none;
    transition: background-color 0.2s var(--ap-ease), color 0.2s var(--ap-ease);
  }

  .tab :deep(.icon) {
    font-size: 22px;
  }

  .tab.is-active {
    background: var(--ap-accent-soft);
    color: var(--ap-accent);
    font-weight: 600;
  }
}
</style>

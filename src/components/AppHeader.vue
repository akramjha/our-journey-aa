<template>
  <header class="navbar">
    <RouterLink to="/" class="brand">Our Journey</RouterLink>

    <nav class="nav-links" aria-label="Main">
      <RouterLink to="/" class="nav-btn">Dashboard</RouterLink>
      <RouterLink to="/savings" class="nav-btn">Gold Savings</RouterLink>
      <RouterLink to="/tunang" class="nav-btn">Tunang</RouterLink>
      <RouterLink to="/checklist" class="nav-btn">Checklist</RouterLink>
      <RouterLink to="/nikah" class="nav-btn">Nikah</RouterLink>
      <RouterLink to="/wedding" class="nav-btn">Wedding</RouterLink>
    </nav>
  </header>
</template>

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
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-btn {
  flex: none;
  padding: 8px 14px;
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

.nav-btn.router-link-exact-active {
  background: var(--ap-fill);
  color: var(--ap-label);
  font-weight: 600;
}

.nav-btn:focus-visible,
.brand:focus-visible {
  outline: 2px solid var(--ap-accent);
  outline-offset: 2px;
}

@media (max-width: 720px) {
  .navbar {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 12px 8px 8px;
    margin-bottom: 24px;
  }

  .brand {
    padding-left: 10px;
  }
}
</style>

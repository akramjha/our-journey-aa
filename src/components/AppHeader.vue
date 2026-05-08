<template>
  <div class="navbar">
    <div class="logo">💍 Our Journey</div>

    <div class="nav-links">
      <RouterLink to="/" class="nav-btn">Dashboard</RouterLink>
      <RouterLink to="/savings" class="nav-btn">Gold Savings</RouterLink>
      <RouterLink to="/tunang" class="nav-btn">Tunang Planner</RouterLink>
      <RouterLink to="/checklist" class="nav-btn">Checklist</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  margin-bottom: 34px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  border-radius: 28px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 24px;
  font-weight: 800;
}

.nav-links {
  display: flex;
  gap: 12px;
}

.nav-btn {
  border: none;
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 999px;
  background: transparent;
  color: #444;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.8);
}

.router-link-active {
  background: linear-gradient(135deg, #ffb6c1, #a0c4ff);
  color: white;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    border-radius: 22px;
    margin-bottom: 24px;
    gap: 16px;
  }

  .logo {
    font-size: 20px;
  }

  .nav-links {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .nav-btn {
    text-align: center;
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
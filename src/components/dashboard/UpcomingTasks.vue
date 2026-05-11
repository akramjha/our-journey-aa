<template>
  <section class="upcoming-card">
    <div class="section-header">
      <div>
        <h2>📝 Upcoming Tasks</h2>
        <p>Things to focus on next</p>
      </div>

      <span>{{ upcomingTasks.length }} task(s)</span>
    </div>

    <div v-if="upcomingTasks.length === 0" class="empty">
      No upcoming tasks yet ✨
    </div>

    <div v-else class="task-list">
      <div
        v-for="task in upcomingTasks"
        :key="task.id"
        class="task-item"
      >
        <div>
          <div class="task-top">
            <span class="module-badge">{{ task.module }}</span>
            <span class="status-badge" :class="task.statusClass">
              {{ task.statusText }}
            </span>
          </div>

          <h3>{{ task.title }}</h3>

          <p>
            📅 {{ formatDate(task.dueDate) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboard } from "@/composables/useDashboard";

const {
  checklistItems,
  tunangItems,
  nikahItems,
  weddingItems
} = useDashboard();

const isCompleted = (item: any) => {
  return (
    item.completed === true ||
    item.progress === "DONE" ||
    item.progress === "APPROVED" ||
    item.progress === "PAID"
  );
};

const getDaysLeft = (date: string) => {
  const today = new Date();
  const due = new Date(date);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const getStatus = (date: string) => {
  const days = getDaysLeft(date);

  if (days < 0) {
    return {
      statusText: "Overdue",
      statusClass: "overdue"
    };
  }

  if (days === 0) {
    return {
      statusText: "Today",
      statusClass: "today"
    };
  }

  if (days <= 3) {
    return {
      statusText: `${days} day(s) left`,
      statusClass: "urgent"
    };
  }

  if (days <= 7) {
    return {
      statusText: `${days} day(s) left`,
      statusClass: "soon"
    };
  }

  return {
    statusText: `${days} day(s) left`,
    statusClass: "normal"
  };
};

const upcomingTasks = computed(() => {
  const checklist = checklistItems.value.map((item: any) => ({
    id: `checklist-${item.id}`,
    title: item.item,
    dueDate: item.dueDate,
    module: "Checklist",
    completed: isCompleted(item)
  }));

  const tunang = tunangItems.value.map((item: any) => ({
    id: `tunang-${item.id}`,
    title: item.name,
    dueDate: item.dueDate,
    module: "Tunang",
    completed: isCompleted(item)
  }));

  const nikah = nikahItems.value.map((item: any) => ({
    id: `nikah-${item.id}`,
    title: item.name,
    dueDate: item.dueDate,
    module: "Nikah",
    completed: isCompleted(item)
  }));

  const wedding = weddingItems.value.map((item: any) => ({
    id: `wedding-${item.id}`,
    title: item.name,
    dueDate: item.dueDate,
    module: "Wedding",
    completed: isCompleted(item)
  }));

  return [...checklist, ...tunang, ...nikah, ...wedding]
    .filter((task) => task.dueDate && !task.completed)
    .map((task) => ({
      ...task,
      ...getStatus(task.dueDate)
    }))
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 6);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};
</script>

<style scoped>
.upcoming-card {
  background: white;
  padding: 28px;
  border-radius: 28px;
  margin: 36px 0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #d63384;
}

.section-header p {
  margin: 6px 0 0;
  color: #777;
}

.section-header span {
  background: #fff0f5;
  color: #d63384;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;
}

.empty {
  padding: 24px;
  border-radius: 20px;
  background: #fff7fb;
  color: #777;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.task-item {
  background: #fff7fb;
  border: 1px solid rgba(255, 182, 193, 0.35);
  border-radius: 22px;
  padding: 18px;
}

.task-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.module-badge,
.status-badge {
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
}

.module-badge {
  background: white;
  color: #d63384;
}

.status-badge.overdue {
  background: #ffe3e3;
  color: #d33;
}

.status-badge.today {
  background: #efe6ff;
  color: #7c3aed;
}

.status-badge.urgent {
  background: #d63384;
  color: white;
}

.status-badge.soon {
  background: #fff2c7;
  color: #9a6a00;
}

.status-badge.normal {
  background: #e6f0ff;
  color: #2f6cd6;
}

.task-item h3 {
  margin: 0;
  color: #333;
}

.task-item p {
  margin: 8px 0 0;
  color: #777;
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .upcoming-card {
    padding: 20px;
    border-radius: 22px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-list {
    grid-template-columns: 1fr;
  }
}
</style>
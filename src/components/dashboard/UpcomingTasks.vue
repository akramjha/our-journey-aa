<template>
  <section class="tasks" aria-labelledby="tasks-title">
    <div class="section-head">
      <h2 id="tasks-title">Upcoming</h2>
      <span v-if="upcomingTasks.length" class="count">
        {{ upcomingTasks.length }} {{ upcomingTasks.length === 1 ? "task" : "tasks" }}
      </span>
    </div>

    <p v-if="upcomingTasks.length === 0" class="empty">
      Nothing due. Enjoy the calm.
    </p>

    <ul v-else class="list">
      <li v-for="task in upcomingTasks" :key="task.id" class="row">
        <div class="row-main">
          <span class="title">{{ task.title }}</span>
          <span class="meta">
            {{ task.module }} · {{ formatDate(task.dueDate) }}
          </span>
        </div>
        <span class="status" :class="task.statusClass">
          {{ task.statusText }}
        </span>
      </li>
    </ul>
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
      statusText: `${days} ${days === 1 ? "day" : "days"} left`,
      statusClass: "urgent"
    };
  }

  if (days <= 7) {
    return {
      statusText: `${days} ${days === 1 ? "day" : "days"} left`,
      statusClass: "soon"
    };
  }

  return {
    statusText: `${days} ${days === 1 ? "day" : "days"} left`,
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
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px 10px;
}

.section-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.count {
  color: var(--ap-label-2);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.empty {
  margin: 0;
  padding: 20px 16px;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  box-shadow: var(--ap-glass-edge);
  border-radius: var(--ap-radius);
  color: var(--ap-label-2);
  font-size: 15px;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--ap-glass);
  -webkit-backdrop-filter: var(--ap-glass-filter);
  backdrop-filter: var(--ap-glass-filter);
  border-radius: var(--ap-radius);
  box-shadow: var(--ap-glass-edge), var(--ap-shadow);
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
}

.row + .row {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.row-main {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.meta {
  color: var(--ap-label-2);
  font-size: 13px;
}

.status {
  flex: none;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--ap-fill);
  color: var(--ap-label-2);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.status.overdue {
  background: color-mix(in srgb, var(--ap-red) 14%, transparent);
  color: var(--ap-red);
}

.status.today {
  background: var(--ap-accent-soft);
  color: var(--ap-accent);
}

.status.urgent {
  background: color-mix(in srgb, var(--ap-orange) 16%, transparent);
  color: var(--ap-orange);
}

.status.soon {
  background: color-mix(in srgb, var(--ap-blue) 13%, transparent);
  color: var(--ap-blue);
}
</style>

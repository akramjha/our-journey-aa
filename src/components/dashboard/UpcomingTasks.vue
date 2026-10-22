<template>
  <section class="tasks" aria-labelledby="tasks-title">
    <div class="section-head">
      <h2 id="tasks-title">Upcoming</h2>
      <span v-if="upcomingTasks.length" class="count">
        {{ upcomingTasks.length }} {{ upcomingTasks.length === 1 ? "task" : "tasks" }}
      </span>
    </div>

    <p v-if="loading" class="empty" role="status">Loading tasks…</p>

    <p v-else-if="upcomingTasks.length === 0" class="empty">
      Nothing due. Enjoy the calm.
    </p>

    <ul v-else class="list">
      <li
        v-for="task in upcomingTasks"
        :key="task.id"
        class="row"
        :class="{ done: pending.has(task.id) }"
      >
        <button
          type="button"
          class="check"
          :aria-label="`Mark ${task.title} as done`"
          :disabled="pending.has(task.id)"
          @click="complete(task)"
        >
          <AppIcon name="check" />
        </button>

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

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useDashboardContext } from "@/composables/useDashboard";
import { updateChecklistItem } from "@/services/checklistService";
import { updateTunangItem } from "@/services/tunangService";
import { updateNikahItem } from "@/services/nikahService";
import { updateWeddingItem } from "@/services/weddingService";

const {
  loading,
  checklistItems,
  tunangItems,
  nikahItems,
  weddingItems
} = useDashboardContext();

const isCompleted = (item: any) => {
  return (
    item.completed === true ||
    item.progress === "DONE" ||
    item.progress === "APPROVED" ||
    item.progress === "PAID"
  );
};

// "YYYY-MM-DD" as a local calendar date; `new Date("2026-12-31")` is UTC midnight
// and can land on the previous day west of Greenwich.
const parseLocalDate = (value: string) => {
  const [y, m, d] = String(value).split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : new Date(value);
};

const getDaysLeft = (date: string) => {
  const today = new Date();
  const due = parseLocalDate(date);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.round(
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
    key: "checklist" as const,
    rawId: item.id as string,
    title: item.item,
    dueDate: item.dueDate,
    module: "Checklist",
    completed: isCompleted(item)
  }));

  const tunang = tunangItems.value.map((item: any) => ({
    id: `tunang-${item.id}`,
    key: "tunang" as const,
    rawId: item.id as string,
    title: item.name,
    dueDate: item.dueDate,
    module: "Tunang",
    completed: isCompleted(item)
  }));

  const nikah = nikahItems.value.map((item: any) => ({
    id: `nikah-${item.id}`,
    key: "nikah" as const,
    rawId: item.id as string,
    title: item.name,
    dueDate: item.dueDate,
    module: "Nikah",
    completed: isCompleted(item)
  }));

  const wedding = weddingItems.value.map((item: any) => ({
    id: `wedding-${item.id}`,
    key: "wedding" as const,
    rawId: item.id as string,
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
        parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime()
    )
    .slice(0, 6);
});

// Same convention the planner pages use: completed + progress "DONE".
const updaters = {
  checklist: updateChecklistItem,
  tunang: updateTunangItem,
  nikah: updateNikahItem,
  wedding: updateWeddingItem
};

const pending = reactive(new Set<string>());
const error = ref("");

const complete = async (task: { id: string; key: keyof typeof updaters; rawId: string; title: string }) => {
  if (pending.has(task.id)) return;
  error.value = "";
  pending.add(task.id);

  try {
    await updaters[task.key](task.rawId, { completed: true, progress: "DONE" });
    // The live listener drops the row and the dashboard progress follows.
  } catch (err) {
    console.error("Failed to complete task:", err);
    pending.delete(task.id);
    error.value = `Couldn't mark "${task.title}" as done. Try again.`;
  }
};

const formatDate = (date: string) => {
  return parseLocalDate(date).toLocaleDateString("en-MY", {
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 16px;
}

.row + .row {
  box-shadow: inset 0 0.5px 0 var(--ap-separator);
}

.row-main {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.check {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  margin: -8px 0 -8px -10px;
  padding: 0;
  border: 0;
  background: none;
  color: transparent;
  font-size: 15px;
  cursor: pointer;
}

/* The visible ring is smaller than the 44px touch target. */
.check::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--ap-label-2);
  transition: background-color 0.25s var(--ap-ease), box-shadow 0.25s var(--ap-ease);
}

.check :deep(.icon) {
  position: relative;
  transform: scale(0.6);
  opacity: 0;
  transition: transform 0.3s var(--ap-ease), opacity 0.2s var(--ap-ease);
}

.check:hover:not(:disabled) {
  color: var(--ap-accent);
}

.check:hover:not(:disabled)::before {
  box-shadow: inset 0 0 0 1.5px var(--ap-accent);
}

.check:hover:not(:disabled) :deep(.icon) {
  opacity: 0.6;
  transform: scale(1);
}

.row.done .check {
  color: #fff;
}

.row.done .check::before {
  background: var(--ap-accent);
  box-shadow: none;
}

.row.done .check :deep(.icon) {
  opacity: 1;
  transform: scale(1);
}

.row.done .row-main,
.row.done .status {
  opacity: 0.45;
  transition: opacity 0.3s var(--ap-ease);
}

.row.done .title {
  text-decoration: line-through;
}

.error {
  margin: 8px 4px 0;
  color: var(--ap-red);
  font-size: 14px;
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
  margin-left: 8px;
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

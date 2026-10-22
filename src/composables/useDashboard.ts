import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  provide,
  inject,
  type InjectionKey
} from "vue";

import { listenChecklistItems } from "@/services/checklistService";
import { listenWeddingItems } from "@/services/weddingService";
import { listenNikahItems } from "@/services/nikahService";
import { listenTunangItems } from "@/services/tunangService";
import { listenContributions } from "@/services/savingsService";

const GOLD_TARGET_GRAMS = 96;

const DASHBOARD_KEY: InjectionKey<ReturnType<typeof useDashboard>> = Symbol("dashboard");

export function useDashboard() {
  const loading = ref(true);

  const checklistItems = ref<any[]>([]);
  const weddingItems = ref<any[]>([]);
  const nikahItems = ref<any[]>([]);
  const tunangItems = ref<any[]>([]);
  const savingsItems = ref<any[]>([]);

  const unsubscribers: Array<() => void> = [];

  const loadDashboardData = () => {
    loading.value = true;

    // Stay in the loading state until every source has delivered its first
    // snapshot, with a timeout so an offline or failing source can't hang the page.
    let pending = 5;
    const firstSnapshot = () => {
      pending = Math.max(0, pending - 1);
      if (pending === 0) loading.value = false;
    };
    const seen = new Set<string>();
    const once = (key: string) => {
      if (seen.has(key)) return;
      seen.add(key);
      firstSnapshot();
    };
    const timeout = setTimeout(() => (loading.value = false), 6000);
    unsubscribers.push(() => clearTimeout(timeout));

    try {
      const unsubChecklist = listenChecklistItems((items) => {
        checklistItems.value = items;
        once("checklist");
      });

      const unsubWedding = listenWeddingItems((items) => {
        weddingItems.value = items;
        once("wedding");
      });

      const unsubNikah = listenNikahItems((items) => {
        nikahItems.value = items;
        once("nikah");
      });

      const unsubTunang = listenTunangItems((items) => {
        tunangItems.value = items;
        once("tunang");
      });

      const unsubSavings = listenContributions((items) => {
        savingsItems.value = items;
        once("savings");
      });

      unsubscribers.push(
        unsubChecklist,
        unsubWedding,
        unsubNikah,
        unsubTunang,
        unsubSavings
      );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      loading.value = false;
    }
  };

  onMounted(() => {
    loadDashboardData();
  });

  onUnmounted(() => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  });

  const isCompleted = (item: any) => {
    return (
      item.completed === true ||
      item.isCompleted === true ||
      item.status === "Completed" ||
      item.status === "Done" ||
      item.progress === "DONE" ||
      item.progress === "APPROVED"
    );
  };

  const totalChecklist = computed(() => checklistItems.value.length);

  const completedChecklist = computed(() =>
    checklistItems.value.filter((item) => isCompleted(item)).length
  );

  const checklistProgress = computed(() => {
    if (totalChecklist.value === 0) return 0;

    return Math.round(
      (completedChecklist.value / totalChecklist.value) * 100
    );
  });

  const totalWeddingItems = computed(() => weddingItems.value.length);

  const completedWeddingItems = computed(() =>
    weddingItems.value.filter((item) => isCompleted(item)).length
  );

  const weddingProgress = computed(() => {
    if (totalWeddingItems.value === 0) return 0;

    return Math.round(
      (completedWeddingItems.value / totalWeddingItems.value) * 100
    );
  });

  const totalNikahItems = computed(() => nikahItems.value.length);

  const completedNikahItems = computed(() =>
    nikahItems.value.filter((item) => isCompleted(item)).length
  );

  const nikahProgress = computed(() => {
    if (totalNikahItems.value === 0) return 0;

    return Math.round(
      (completedNikahItems.value / totalNikahItems.value) * 100
    );
  });

  const totalTunangItems = computed(() => tunangItems.value.length);

  const completedTunangItems = computed(() =>
    tunangItems.value.filter((item) => isCompleted(item)).length
  );

  const tunangProgress = computed(() => {
    if (totalTunangItems.value === 0) return 0;

    return Math.round(
      (completedTunangItems.value / totalTunangItems.value) * 100
    );
  });

  // Budget: sum of item prices per planner, the same rule the planner pages use.
  const isSettled = (item: any) => isCompleted(item) || item.progress === "PAID";

  const sumPrices = (items: any[], filter: (item: any) => boolean = () => true) =>
    items.filter(filter).reduce((total, item) => total + Number(item.price || 0), 0);

  const budgetRows = computed(() =>
    [
      { key: "tunang", label: "Tunang", items: tunangItems.value },
      { key: "nikah", label: "Nikah", items: nikahItems.value },
      { key: "wedding", label: "Wedding", items: weddingItems.value }
    ].map(({ key, label, items }) => ({
      key,
      label,
      planned: sumPrices(items),
      settled: sumPrices(items, isSettled)
    }))
  );

  const totalSavingsCurrent = computed(() => {
    return savingsItems.value.reduce((total, item) => {
      return total + Number(item.purchasePrice || 0);
    }, 0);
  });

  const totalSavingsTarget = computed(() => GOLD_TARGET_GRAMS);

  const totalGoldWeight = computed(() => {
    return savingsItems.value.reduce((total, item) => {
      const pricePerGram = Number(item.currentGoldPricePerGram || 0);
      const purchasePrice = Number(item.purchasePrice || 0);

      if (pricePerGram <= 0) return total;

      return total + purchasePrice / pricePerGram;
    }, 0);
  });

  const savingsProgress = computed(() => {
    return Math.min(
      100,
      Math.round((totalGoldWeight.value / GOLD_TARGET_GRAMS) * 100)
    );
  });

  const api = {
    loading,

    checklistItems,
    weddingItems,
    nikahItems,
    tunangItems,
    savingsItems,

    totalChecklist,
    completedChecklist,
    checklistProgress,

    totalWeddingItems,
    completedWeddingItems,
    weddingProgress,

    totalNikahItems,
    completedNikahItems,
    nikahProgress,

    totalTunangItems,
    completedTunangItems,
    tunangProgress,

    budgetRows,

    totalSavingsTarget,
    totalSavingsCurrent,
    totalGoldWeight,
    savingsProgress,

    loadDashboardData,
  };

  // Children of the page that owns the listeners reuse them via useDashboardContext().
  provide(DASHBOARD_KEY, api);

  return api;
}

/** Shared dashboard data from the nearest provider, or its own listeners when there is none. */
export function useDashboardContext() {
  return inject(DASHBOARD_KEY, null) ?? useDashboard();
}
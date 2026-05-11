import { ref, computed, onMounted, onUnmounted } from "vue";

import { listenChecklistItems } from "@/services/checklistService";
import { listenWeddingItems } from "@/services/weddingService";
import { listenNikahItems } from "@/services/nikahService";
import { listenTunangItems } from "@/services/tunangService";
import { listenContributions } from "@/services/savingsService";

const GOLD_TARGET_GRAMS = 96;

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

    try {
      const unsubChecklist = listenChecklistItems((items) => {
        checklistItems.value = items;
      });

      const unsubWedding = listenWeddingItems((items) => {
        weddingItems.value = items;
      });

      const unsubNikah = listenNikahItems((items) => {
        nikahItems.value = items;
      });

      const unsubTunang = listenTunangItems((items) => {
        tunangItems.value = items;
      });

      const unsubSavings = listenContributions((items) => {
        savingsItems.value = items;
      });

      unsubscribers.push(
        unsubChecklist,
        unsubWedding,
        unsubNikah,
        unsubTunang,
        unsubSavings
      );

      loading.value = false;
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

  return {
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

    totalSavingsTarget,
    totalSavingsCurrent,
    totalGoldWeight,
    savingsProgress,

    loadDashboardData,
  };
}
import { ref, watch, onUnmounted, type Ref } from "vue";

/**
 * Eases a displayed number toward `target`, starting from wherever it currently is.
 * Exponential ease-out; people who prefer reduced motion get the value immediately.
 */
export function useCountUp(target: Ref<number | null>, duration = 1400) {
  const display = ref(0);
  let frame = 0;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  watch(
    target,
    (to) => {
      stop();
      if (to === null) return;
      if (reduced) {
        display.value = to;
        return;
      }

      const from = display.value;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(2, -10 * t);
        display.value = Math.round(from + (to - from) * (t === 1 ? 1 : eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    },
    { immediate: true }
  );

  onUnmounted(stop);

  return display;
}

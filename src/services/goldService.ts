export type GoldMode = "public" | "market";

/* 💎 HYBRID GOLD ENGINE */
export const getGoldPriceMYR = async (
  mode: GoldMode
): Promise<number> => {
  try {
    /* =========================
       🟡 PUBLIC GOLD MODE
    ========================= */
    if (mode === "public") {
      const base = 647; // your reference
      const fluctuation = (Math.random() - 0.5) * 6; // ±3 RM

      return Number((base + fluctuation).toFixed(2));
    }

    /* =========================
       🌍 MARKET GOLD MODE
    ========================= */
    if (mode === "market") {
      const usdGold = 2300; // simulated XAU/USD
      const usdToMyr = 4.7;

      const perGram = (usdGold * usdToMyr) / 31.1035;

      return Number(perGram.toFixed(2));
    }

    return 647;
  } catch (err) {
    console.error(err);
    return 647;
  }
};
import { db } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { WeddingSavings } from "@/types/wedding";

// 💰 SAVINGS
export const getSavings = async (): Promise<WeddingSavings[]> => {
  const snapshot = await getDocs(collection(db, "wedding_savings"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<WeddingSavings, "id">)
  }));
};

// 📋 TASKS
export const getTasks = async () => {
  const snapshot = await getDocs(collection(db, "wedding_tasks"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// 🛒 SHOPPING
export const getShopping = async () => {
  const snapshot = await getDocs(collection(db, "wedding_shopping"));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
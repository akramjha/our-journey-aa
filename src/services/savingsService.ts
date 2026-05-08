import { db } from "@/firebase/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";

const COL = "gold_contributions";

/* 🔄 REAL-TIME LISTENER */
export const listenContributions = (callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, COL), (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    callback(data);
  });
};

/* ➕ CREATE */
export const addContribution = async (data: any) => {
  return await addDoc(collection(db, COL), data);
};

/* ❌ DELETE */
export const deleteContribution = async (id: string) => {
  return await deleteDoc(doc(db, COL, id));
};

/* ✏️ UPDATE */
export const updateContribution = async (id: string, data: any) => {
  return await updateDoc(doc(db, COL, id), data);
};
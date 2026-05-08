import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/firebase/firebase";
import type { WeddingEventItem } from "@/types/wedding";

const COLLECTION_NAME = "weddingEventPlanner";

export const addWeddingItem = async (data: WeddingEventItem) => {
  await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Date.now()
  });
};

export const listenWeddingItems = (
  callback: (items: WeddingEventItem[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as WeddingEventItem[];

    callback(items);
  });
};

export const deleteWeddingItem = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const updateWeddingItem = async (
  id: string,
  data: Partial<WeddingEventItem>
) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};
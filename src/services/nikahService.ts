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

import type { NikahItem } from "@/types/nikah";

const COLLECTION_NAME = "nikahPlanner";

export const addNikahItem = async (data: NikahItem) => {
  await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Date.now()
  });
};

export const listenNikahItems = (
  callback: (items: NikahItem[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as NikahItem[];

    callback(items);
  });
};

export const deleteNikahItem = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const updateNikahItem = async (
  id: string,
  data: Partial<NikahItem>
) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};
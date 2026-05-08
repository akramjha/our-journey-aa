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

import type { ChecklistItem } from "@/types/checklist";

const COLLECTION_NAME = "checklistItems";

/* ADD */
export const addChecklistItem = async (
  data: ChecklistItem
) => {

  await addDoc(
    collection(db, COLLECTION_NAME),
    {
      ...data,
      createdAt: Date.now()
    }
  );

};

/* REALTIME */
export const listenChecklistItems = (
  callback: (items: ChecklistItem[]) => void
) => {

  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as ChecklistItem[];

    callback(items);

  });

};

/* DELETE */
export const deleteChecklistItem = async (
  id: string
) => {

  await deleteDoc(
    doc(db, COLLECTION_NAME, id)
  );

};

/* UPDATE */
export const updateChecklistItem = async (
  id: string,
  data: Partial<ChecklistItem>
) => {

  await updateDoc(
    doc(db, COLLECTION_NAME, id),
    data
  );

};
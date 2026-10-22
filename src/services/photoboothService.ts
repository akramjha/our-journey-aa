import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

const COLLECTION_NAME = "photoboothMemories";

export interface PhotoboothMemory {
  id?: string;
  /** "YYYY-MM", used for ordering and the month label. */
  month: string;
  caption: string;
  url: string;
  createdAt?: number;
}

/* ADD */
export const addPhotoboothMemory = async (
  data: Omit<PhotoboothMemory, "id" | "createdAt">
) => {
  await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Date.now()
  });
};

/* REALTIME */
export const listenPhotoboothMemories = (
  callback: (items: PhotoboothMemory[]) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PhotoboothMemory[]
    );
  });
};

/* DELETE */
export const deletePhotoboothMemory = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

import type { TunangItem } from "@/types/tunang";

const COLLECTION_NAME = "tunangPlanner";

/* ADD */
export const addTunangItem = async (
  data: TunangItem
) => {

  await addDoc(
    collection(db, COLLECTION_NAME),
    {
      ...data,
      createdAt: Date.now()
    }
  );

};

/* REALTIME LISTENER */
export const listenTunangItems = (
  callback: (items: TunangItem[]) => void
) => {

  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as TunangItem[];

    callback(items);

  });

};

/* DELETE */
export const deleteTunangItem = async (
  id: string
) => {

  await deleteDoc(
    doc(db, COLLECTION_NAME, id)
  );

};

/* UPDATE */
export const updateTunangItem = async (
  id: string,
  data: Partial<TunangItem>
) => {

  await updateDoc(
    doc(db, COLLECTION_NAME, id),
    data
  );

};
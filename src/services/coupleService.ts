import {
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

const DOC_ID = "main";

export const saveCoupleSettings = async (data: any) => {
  await setDoc(
    doc(db, "coupleSettings", DOC_ID),
    data
  );
};

export const getCoupleSettings = async () => {
  const snapshot = await getDoc(
    doc(db, "coupleSettings", DOC_ID)
  );

  if (!snapshot.exists()) return null;

  return snapshot.data();
};

export const listenCoupleSettings = (
  callback: (data: any) => void
) => {
  return onSnapshot(
    doc(db, "coupleSettings", DOC_ID),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    }
  );
};
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9mlkc5uub_69CT0vLIRM4qCM3pnkYW9o",
  authDomain: "our-journey-aa.firebaseapp.com",
  projectId: "our-journey-aa",
  storageBucket: "our-journey-aa.firebasestorage.app",
  messagingSenderId: "348239362275",
  appId: "1:348239362275:web:8d52520b2a01437b87add6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
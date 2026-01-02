
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * Project: uniscrapper-pro
 */
const firebaseConfig = {
  apiKey: "AIzaSyC1xJoHny4C7ViqpUTW0MY8rAhk1M8Y2xw",
  authDomain: "uniscrapper-pro.firebaseapp.com",
  projectId: "uniscrapper-pro",
  storageBucket: "uniscrapper-pro.firebasestorage.app",
  messagingSenderId: "921601102504",
  appId: "1:921601102504:web:ed1cdffe7b0c998901289d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

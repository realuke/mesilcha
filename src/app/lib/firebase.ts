'use client';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjBX7QPBXMHzlKdnrE1C917ef_fURGKac",
  authDomain: "mesilcha.firebaseapp.com",
  projectId: "mesilcha",
  storageBucket: "mesilcha.firebasestorage.app",
  messagingSenderId: "1013280194755",
  appId: "1:1013280194755:web:079bfcea9ddd5cdb06e276",
  measurementId: "G-GB73CW0FYC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
// firebase-config.js - Firebase initialization
// Replace the values below with your Firebase project credentials
// Get these from Firebase Console: Project Settings → Your apps → Web

const firebaseConfig = {
  apiKey: "AIzaSyDVddJ45zp8ftjm9FnywF0icN2Q9cwK9qk",
  authDomain: "vaalwebsites.firebaseapp.com",
  projectId: "vaalwebsites",
  storageBucket: "vaalwebsites.firebasestorage.app",
  messagingSenderId: "521984179530",
  appId: "1:521984179530:web:bf62f2c5cadac0dbddd5b3",
  measurementId: "G-XSZXS29NJ5"
};
// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

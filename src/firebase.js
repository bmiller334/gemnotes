// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmCxjSDNe_UvSKhHCq2gjv8I-Bie7Q39Q",
  authDomain: "gemnote-3ce83.firebaseapp.com",
  projectId: "gemnote-3ce83",
  storageBucket: "gemnote-3ce83.firebasestorage.app",
  messagingSenderId: "456303108642",
  appId: "1:456303108642:web:562f8018542fd36e0f607b",
  measurementId: "G-2JVR5JMECX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

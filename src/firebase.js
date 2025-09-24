// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
export const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log("Persistence failed, likely due to multiple tabs open.");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.log("Persistence is not available in this browser.");
    }
  });

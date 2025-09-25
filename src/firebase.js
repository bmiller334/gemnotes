// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmCxjSDNe_UvSKhHCq2gjv8I-Bie7Q39Q",
  authDomain: "gemnote-3ce83.firebaseapp.com",
  projectId: "gemnote-3ce83",
  storageBucket: "gemnote-3ce83.appspot.com",
  messagingSenderId: "456303108642",
  appId: "1:456303108642:web:562f8018542fd36e0f607b",
  measurementId: "G-2JVR5JMECX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // This can happen if multiple tabs are open.
      console.log("Persistence failed, likely due to multiple tabs open.");
    } else if (err.code == 'unimplemented') {
      // The browser doesn't support all features required.
      console.log("Persistence is not available in this browser.");
    }
  });

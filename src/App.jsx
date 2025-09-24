import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import Layout from "@/components/Layout";
import NewNote from "@/pages/NewNote";
import Notes from "@/pages/Notes";
import Doss from "@/pages/Doss";
import DossNotes from "@/pages/DossNotes";
import Settings from "@/pages/Settings";

function App() {
  const [notes, setNotes] = useState([]);
  const [doss, setDoss] = useState([]);

  // Set up real-time listeners for notes and doss
  useEffect(() => {
    const unsubscribeNotes = onSnapshot(collection(db, "notes"), (snapshot) => {
      setNotes(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    const unsubscribeDoss = onSnapshot(collection(db, "doss"), (snapshot) => {
      setDoss(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    // Clean up the listeners when the component unmounts
    return () => {
      unsubscribeNotes();
      unsubscribeDoss();
    };
  }, []);

  // Functions now only need to interact with Firestore.
  // The onSnapshot listener will handle updating the UI.
  const addNote = async (note) => {
    await addDoc(collection(db, "notes"), note);
  };

  const addDoss = async (dossName) => {
    await addDoc(collection(db, "doss"), { name: dossName });
  };

  const deleteDoss = async (dossId) => {
    await deleteDoc(doc(db, "doss", dossId));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout outletContext={{ notes, addNote, doss, addDoss, deleteDoss }} />}>
          <Route index element={<NewNote />} />
          <Route path="dos" element={<Notes />} />
          <Route path="doss" element={<Doss />} />
          <Route path="doss/:dossId" element={<DossNotes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

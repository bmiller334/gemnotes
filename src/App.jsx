import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout"; // Renaming Layout to AppLayout to avoid confusion
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NewNote from "./pages/NewNote";
import Notes from "./pages/Notes";
import Doss from "./pages/Doss";
import DossNotes from "./pages/DossNotes";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NewNote />} />
            <Route path="dos" element={<Notes />} />
            <Route path="doss" element={<Doss />} />
            <Route path="doss/:dossId" element={<DossNotes />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

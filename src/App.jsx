import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import NewNote from "./pages/NewNote";
import NoteList from "./pages/NoteList";
import NoteDetail from "./pages/NoteDetail";
import Doss from "./pages/Doss";
import DossNotes from "./pages/DossNotes";
import DossDetail from "./pages/DossDetail";
import Tados from "./pages/Tados";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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
              <Route path="dos" element={<NoteList />} />
              <Route path="dos/:noteId" element={<NoteDetail />} />
              <Route path="doss" element={<Doss />} />
              <Route path="doss/:dossId" element={<DossNotes />} />
              <Route path="doss/:dossId/manage" element={<DossDetail />} />
              <Route path="tados" element={<Tados />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
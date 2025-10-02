import { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const autoSignInAttempted = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Auto-login in development environment, but only attempt it once.
    if (import.meta.env.DEV && !auth.currentUser && !autoSignInAttempted.current) {
      autoSignInAttempted.current = true; // Mark that we've attempted the sign-in
      const testEmail = 'test@example.com';
      const testPassword = 'password';
      signInWithEmailAndPassword(auth, testEmail, testPassword)
        .catch((error) => {
          console.error("Automatic sign-in failed:", error.message);
        });
    }


    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

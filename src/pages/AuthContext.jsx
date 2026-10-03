import { createContext, useContext, useEffect, useState } from "react";
import {
  SESSION_EXPIRED_EVENT,
  login as apiLogin,
  logoutSession,
  restoreSession,
} from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      try {
        const restoredUser = await restoreSession();
        if (active && restoredUser) {
          setUser(restoredUser);
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    };

    const handleExpiredSession = () => {
      if (active) {
        setUser(null);
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    bootstrapSession();

    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    };
  }, []);

  const login = async (username, password) => {
    const authenticatedUser = await apiLogin(username, password);
    setUser(authenticatedUser);
    return true;
  };

  const logout = async () => {
    try {
      await logoutSession();
    } catch {
      // El estado local se limpia aunque el backend no esté disponible.
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "ADMIN",
        initializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }
  return context;
};

// src/pages/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Guardamos si está autenticado y si es admin
  const [user, setUser] = useState(() => {
    // Si ya inició sesión antes, lo cargamos del localStorage
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // función para login (admin)
  const login = (username, password) => {
    // 👇 Aquí defines tus credenciales base (por ahora hardcodeadas)
    if (username === "yeik" && password === "ahinara") {
      const userData = { username, isAdmin: true };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    return false; // login fallido
  };

  // logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin || false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

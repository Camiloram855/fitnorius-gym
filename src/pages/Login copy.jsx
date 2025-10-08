import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login(credentials.username, credentials.password);
    if (success) {
      navigate("/catalog"); // ✅ redirige al catálogo principal
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/catalog"); // ✅ vuelve al catálogo al cerrar sesión
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6">
      {!isAdmin ? (
        <>
          <h1 className="text-3xl font-bold mb-6">Iniciar sesión </h1>

          <form
            onSubmit={handleLogin}
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm"
          >
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Usuario</label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-1 font-semibold">Contraseña</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                required
              />
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded font-semibold"
            >
              Iniciar sesión
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            ¡Hola YEIK! Ya has iniciado sesión.
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

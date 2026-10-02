import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import CreateUserModal from "./CreateUserModal";

export default function Login() {
  const { isAdmin, user, initializing, login, logout } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(credentials.username, credentials.password);
      navigate("/catalog", { replace: true });
    } catch (requestError) {
      if (requestError?.status === 429) {
        setError("Demasiados intentos. Espera unos minutos antes de volver a intentarlo.");
      } else {
        setError("No se pudo iniciar sesión. Verifica tus credenciales.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/catalog", { replace: true });
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Cargando sesión...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6">
      {!isAdmin ? (
        <>
          <h1 className="text-3xl font-bold mb-6">Iniciar sesión</h1>

          <form
            onSubmit={handleLogin}
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm"
          >
            <div className="mb-4">
              <label className="block mb-1 font-semibold" htmlFor="username">
                Correo electrónico
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={credentials.username}
                onChange={(event) => {
                  setError("");
                  setCredentials({ ...credentials, username: event.target.value });
                }}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                autoComplete="username"
                inputMode="email"
                maxLength={254}
                required
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">
                Usa el correo con el que se creó la cuenta.
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-1 font-semibold" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={(event) => {
                  setError("");
                  setCredentials({ ...credentials, password: event.target.value });
                }}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                autoComplete="current-password"
                maxLength={256}
                required
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-red-400 mb-4" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 py-2 rounded font-semibold"
            >
              {isSubmitting ? "Validando..." : "Iniciar sesión"}
            </button>
          </form>
        </>
      ) : (
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-1">Sesión administrativa activa</h1>
          {user?.username && (
            <p className="text-sm text-gray-400 mb-6 break-all">{user.username}</p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-semibold"
            >
              Crear usuario
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold"
            >
              Cerrar sesión
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            El botón de crear usuario solo aparece con una sesión de administrador.
          </p>

          {showCreateUser && (
            <CreateUserModal onClose={() => setShowCreateUser(false)} />
          )}
        </div>
      )}
    </div>
  );
}

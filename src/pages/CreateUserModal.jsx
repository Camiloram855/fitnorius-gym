import { useEffect, useMemo, useState } from "react";
import { createUser, fetchPasswordPolicy, listUsers } from "../api/client";

/**
 * Lista equivalente a la del backend, usada solo si el endpoint de política no
 * responde. El servidor sigue siendo quien valida: esto es la vista previa.
 */
const FALLBACK_RULES = [
  { id: "length", description: "Entre 12 y 256 caracteres" },
  { id: "lowercase", description: "Al menos una letra minúscula" },
  { id: "uppercase", description: "Al menos una letra mayúscula" },
  { id: "digit", description: "Al menos un número" },
  { id: "special", description: "Al menos un carácter especial (!@#$%...)" },
  { id: "noSpaces", description: "Sin espacios" },
  { id: "notEmail", description: "No puede contener el correo ni su usuario" },
];

const CLIENT_CHECKS = {
  length: (password) => password.length >= 12 && password.length <= 256,
  lowercase: (password) => /[a-z]/.test(password),
  uppercase: (password) => /[A-Z]/.test(password),
  digit: (password) => /[0-9]/.test(password),
  special: (password) => /[^A-Za-z0-9]/.test(password),
  noSpaces: (password) => !/\s/.test(password),
  notEmail: (password, email) => {
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized) {
      return true;
    }
    const localPart = normalized.includes("@") ? normalized.split("@")[0] : normalized;
    const candidate = password.toLowerCase();
    return !candidate.includes(localPart) && !candidate.includes(normalized);
  },
};

// Espejo de CredentialPolicy.isValidEmail del backend.
const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

function isEmailValid(email) {
  const value = (email || "").trim();
  return value.length >= 6 && value.length <= 254 && EMAIL_PATTERN.test(value);
}

export default function CreateUserModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rules, setRules] = useState(FALLBACK_RULES);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [policy, existing] = await Promise.all([fetchPasswordPolicy(), listUsers()]);
      if (!active) {
        return;
      }
      if (Array.isArray(policy?.rules) && policy.rules.length > 0) {
        setRules(policy.rules);
      }
      setUsers(existing);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSaving, onClose]);

  const emailValid = isEmailValid(email);

  const ruleResults = useMemo(
    () =>
      rules.map((rule) => ({
        ...rule,
        satisfied: CLIENT_CHECKS[rule.id]
          ? CLIENT_CHECKS[rule.id](password, email)
          : false,
      })),
    [rules, password, email]
  );

  const pendingRules = ruleResults.filter((rule) => !rule.satisfied);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const canSubmit = emailValid && pendingRules.length === 0 && passwordsMatch && !isSaving;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setError("");
    setNotice("");
    setIsSaving(true);

    try {
      const created = await createUser(email.trim(), password);
      setNotice(`Usuario ${created.email} creado. Ya puede iniciar sesión con ese correo.`);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsers(await listUsers());
    } catch (requestError) {
      if (requestError?.status === 409) {
        setError("Ya existe un usuario registrado con ese correo.");
      } else if (requestError?.status === 401) {
        setError("Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.");
      } else {
        setError(requestError?.message || "No se pudo crear el usuario.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crear-usuario-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="crear-usuario-title" className="text-xl font-bold">
              Crear usuario
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Tendrá acceso completo al panel, igual que tu sesión actual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="mb-1 block font-semibold" htmlFor="new-user-email">
              Correo electrónico
            </label>
            <input
              id="new-user-email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => {
                setError("");
                setNotice("");
                setEmail(event.target.value);
              }}
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-white outline-none focus:border-purple-500"
              placeholder="persona@fitnorius.co"
              autoComplete="off"
              maxLength={254}
              required
              disabled={isSaving}
            />
            {email.length > 0 && !emailValid && (
              <p className="mt-1.5 text-sm text-red-400">
                Escribe un correo electrónico válido.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-semibold" htmlFor="new-user-password">
              Contraseña
            </label>
            <input
              id="new-user-password"
              type="password"
              name="new-password"
              value={password}
              onChange={(event) => {
                setError("");
                setNotice("");
                setPassword(event.target.value);
              }}
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-white outline-none focus:border-purple-500"
              autoComplete="new-password"
              maxLength={256}
              required
              disabled={isSaving}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-semibold" htmlFor="new-user-confirm">
              Repetir contraseña
            </label>
            <input
              id="new-user-confirm"
              type="password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(event) => {
                setError("");
                setNotice("");
                setConfirmPassword(event.target.value);
              }}
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-white outline-none focus:border-purple-500"
              autoComplete="new-password"
              maxLength={256}
              required
              disabled={isSaving}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1.5 text-sm text-red-400">Las contraseñas no coinciden.</p>
            )}
          </div>

          <fieldset className="mb-5 rounded-lg border border-white/10 bg-gray-800/60 p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Requisitos
            </legend>
            <ul className="grid gap-1.5">
              {ruleResults.map((rule) => (
                <li
                  key={rule.id}
                  className={`flex items-center gap-2 text-sm ${
                    rule.satisfied ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  <span aria-hidden="true" className="w-4 text-center">
                    {rule.satisfied ? "✓" : "•"}
                  </span>
                  <span>{rule.description}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-purple-600 py-2.5 font-semibold hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Creando..." : "Crear usuario"}
          </button>
        </form>

        {users.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-300">
              Usuarios registrados ({users.length})
            </h3>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-gray-400">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3">
                  <span className="truncate">{user.email}</span>
                  <span className="shrink-0 text-xs text-gray-500">{user.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

import API_URL from "../config";

const API_BASE = API_URL.replace(/\/+$/, "");
const REFRESH_HEADER = "X-Refresh-Request";
const SESSION_EXPIRED_EVENT = "fitnorius:session-expired";

let accessToken = null;
let refreshPromise = null;

function resolveUrl(input) {
  if (typeof input !== "string") {
    return input;
  }
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  return `${API_BASE}/${input.replace(/^\/+/, "")}`;
}

function isApiUrl(input) {
  const url = String(resolveUrl(input));
  return url === API_BASE || url.startsWith(`${API_BASE}/`);
}

function isAuthEndpoint(input) {
  const url = String(resolveUrl(input));
  return [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
  ].some((path) => url === `${API_BASE}${path}`);
}

function notifySessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

function setAccessToken(token) {
  accessToken = typeof token === "string" && token.length > 0 ? token : null;
}

function addAuthorization(headers) {
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
}

async function rawFetch(input, init = {}) {
  const url = resolveUrl(input);
  const headers = new Headers(init.headers || {});
  const apiUrl = isApiUrl(input);
  const authEndpoint = isAuthEndpoint(input);

  if (!apiUrl) {
    // Nunca enviar el Bearer token a un host externo por accidente.
    headers.delete("Authorization");
  } else if (!authEndpoint) {
    addAuthorization(headers);
  }

  // La cookie refresh solo se necesita en endpoints de autenticación.
  const credentials = apiUrl && (authEndpoint || init.credentials === "include")
    ? "include"
    : "omit";

  const requestInit = { ...init };
  delete requestInit.__authRetried;
  return fetch(url, {
    ...requestInit,
    headers,
    credentials,
    cache: init.cache || (authEndpoint ? "no-store" : undefined),
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { [REFRESH_HEADER]: "1" },
      credentials: "include",
      cache: "no-store",
    });

    // No había una sesión de refresh: es un estado normal para visitantes.
    if (response.status === 204) {
      setAccessToken(null);
      return null;
    }
    if (!response.ok) {
      throw new Error("No se pudo renovar la sesión");
    }

    const data = await readJson(response);
    if (!data?.accessToken) {
      throw new Error("Respuesta de sesión inválida");
    }
    setAccessToken(data.accessToken);
    return data.user || null;
  })()
    .catch((error) => {
      setAccessToken(null);
      notifySessionExpired();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Fetch central para todas las llamadas al backend. Añade el Bearer token
 * cuando existe y renueva una sola vez ante un 401 de una petición protegida.
 * El access token nunca se guarda en localStorage/sessionStorage.
 */
export async function apiFetch(input, init = {}) {
  const hadAccessToken = Boolean(accessToken);
  const response = await rawFetch(input, init);

  const canRetry = response.status === 401
    && hadAccessToken
    && isApiUrl(input)
    && !isAuthEndpoint(input)
    && !init.__authRetried;

  if (!canRetry) {
    return response;
  }

  try {
    const refreshedUser = await refreshSession();
    if (!refreshedUser && !getAccessToken()) {
      notifySessionExpired();
      return response;
    }
  } catch {
    return response;
  }

  const retryHeaders = new Headers(init.headers || {});
  addAuthorization(retryHeaders);
  return rawFetch(input, { ...init, headers: retryHeaders, __authRetried: true });
}

export async function login(username, password) {
  const response = await rawFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data?.message || "No se pudo iniciar sesión");
    error.status = response.status;
    throw error;
  }
  if (!data?.accessToken) {
    throw new Error("Respuesta de autenticación inválida");
  }
  setAccessToken(data.accessToken);
  return data.user || null;
}

export async function restoreSession() {
  try {
    return await refreshSession();
  } catch {
    return null;
  }
}

export async function logoutSession() {
  try {
    await rawFetch("/api/auth/logout", {
      method: "POST",
      headers: { [REFRESH_HEADER]: "1" },
    });
  } finally {
    setAccessToken(null);
  }
}

export async function getCurrentUser() {
  const response = await apiFetch("/api/auth/me");
  if (!response.ok) {
    return null;
  }
  return readJson(response);
}

export function getAccessToken() {
  return accessToken;
}

/**
 * Reglas de contraseña publicadas por el backend. Se piden para que el
 * formulario de alta no duplique la política: el servidor sigue siendo la
 * única autoridad y el cliente solo muestra la misma lista.
 */
export async function fetchPasswordPolicy() {
  const response = await rawFetch("/api/auth/password-policy");
  if (!response.ok) {
    return null;
  }
  return readJson(response);
}

/** Alta de usuario. Requiere un token de administrador activo. */
export async function createUser(email, password) {
  const response = await apiFetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data?.message || "No se pudo crear el usuario");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function listUsers() {
  const response = await apiFetch("/api/admin/users");
  if (!response.ok) {
    return [];
  }
  const data = await readJson(response);
  return Array.isArray(data) ? data : [];
}

export { SESSION_EXPIRED_EVENT };

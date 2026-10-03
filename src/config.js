// La URL del backend es pública por naturaleza; nunca colocar aquí secretos JWT.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = (configuredApiUrl || "http://localhost:8080").replace(/\/+$/, "");

export default API_URL;

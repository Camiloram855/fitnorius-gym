// src/config.js
const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8080";

console.log("🌍 API_URL en uso:", API_URL);

export default API_URL;

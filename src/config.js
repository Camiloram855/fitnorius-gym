// src/config.js

// 🔍 Mostrar todas las variables visibles en tiempo de build
console.log("🧾 import.meta.env:", import.meta.env);

// Obtener la URL de la API desde las variables de entorno
const apiUrl = import.meta.env.VITE_API_URL;

// Si no existe, usar el backend local
const API_URL = apiUrl && apiUrl.trim() !== "" 
  ? apiUrl.trim() 
  : "http://localhost:8080";

console.log("🌍 API_URL en uso:", API_URL);

export default API_URL;

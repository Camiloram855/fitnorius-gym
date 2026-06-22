// src/config.js

const apiUrl = import.meta.env.VITE_API_URL;

const API_URL = apiUrl && apiUrl.trim() !== ""
  ? apiUrl.trim()
  : "https://fitnorius-production.up.railway.app";

export default API_URL;

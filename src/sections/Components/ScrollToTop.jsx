// src/sections/Components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Evita que el navegador recuerde la posición anterior
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Reinicia el scroll instantáneamente
    window.scrollTo(0, 0);

    // A veces React Router o el navegador lo sobrescriben justo después
    // así que hacemos un refuerzo con un pequeño delay
    const fix = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 400);

    return () => clearTimeout(fix);
  }, [pathname]);

  return null;
}

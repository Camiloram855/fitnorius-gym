// src/sections/Components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Forzamos varias veces el scroll al tope
    const scrollToTopNow = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Inmediatamente
    scrollToTopNow();

    // A los 100ms (por si React Router restaura después del render)
    const t1 = setTimeout(scrollToTopNow, 100);
    // A los 400ms (por si imágenes o contenido tardan en cargar)
    const t2 = setTimeout(scrollToTopNow, 400);
    // A los 800ms (refuerzo final)
    const t3 = setTimeout(scrollToTopNow, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}

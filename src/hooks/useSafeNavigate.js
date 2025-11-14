import { useNavigate } from "react-router-dom";

export default function useSafeNavigate() {
  const navigate = useNavigate();

  return (to) => {
    // Evita scroll restore ANTES del cambio de ruta
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    navigate(to);
  };
}

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const STORAGE_KEY = "fitnorius_promo_popup_dismissed";

export default function PromotionPopup() {
  const [popup, setPopup] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  const loadPopup = async () => {
    try {
      const response = await fetch(`${API_URL}/api/promotion-popup`);
      if (!response.ok) throw new Error("No se pudo cargar el popup");
      const data = await response.json();
      setPopup(data || null);
    } catch (error) {
      setPopup(null);
    }
  };

  useEffect(() => {
    loadPopup();
  }, []);

  useEffect(() => {
    const refresh = () => {
      sessionStorage.removeItem(STORAGE_KEY);
      loadPopup();
    };
    window.addEventListener("promotion-popup-updated", refresh);
    return () => window.removeEventListener("promotion-popup-updated", refresh);
  }, []);

  useEffect(() => {
    if (!popup?.active || !popup?.imageUrl) {
      setMounted(false);
      return;
    }

    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setMounted(false);
      return;
    }

    const timer = setTimeout(() => {
      setMounted(true);
      requestAnimationFrame(() => setClosing(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [popup]);

  const handleClose = () => {
    setClosing(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
    window.setTimeout(() => setMounted(false), 220);
  };

  if (!mounted || !popup?.imageUrl || !popup?.active) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div
        className={`relative w-full max-w-md sm:max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          closing ? "opacity-0 scale-95 translate-y-2" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/10 p-2 text-gray-700 transition hover:bg-black/20 hover:text-black"
          aria-label="Cerrar promoción"
        >
          <X size={18} />
        </button>

        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[240px] bg-gradient-to-br from-purple-100 via-white to-pink-50">
            <img
              src={popup.imageUrl}
              alt="Promoción especial"
              className="h-full w-full object-cover md:rounded-l-3xl"
            />
          </div>

          <div className="flex flex-col justify-center gap-4 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-purple-600">
                Promoción
              </p>
              <h3 className="mt-2 text-2xl font-black text-gray-900">
                No te pierdas esta oferta
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Esta imagen promocional la puede actualizar el administrador cuando quiera.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-fuchsia-700"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

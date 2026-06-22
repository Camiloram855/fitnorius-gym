import { useEffect, useState } from "react";
import { X } from "lucide-react";
import API_URL from "../../config";

const STORAGE_KEY = "fitnorius_promo_popup_dismissed";

export default function PromotionPopup() {
  const [popup, setPopup] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  const loadPopup = async () => {
    try {
      const response = await fetch(`${API_URL}/api/promotion-popup`);

      if (!response.ok) {
        throw new Error("No se pudo cargar el popup");
      }

      const data = await response.json();
      setPopup(data || null);
    } catch (error) {
      console.error(error);
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

    return () => {
      window.removeEventListener("promotion-popup-updated", refresh);
    };
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
      requestAnimationFrame(() => {
        setClosing(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [popup]);

  const handleClose = () => {
    setClosing(true);
    sessionStorage.setItem(STORAGE_KEY, "1");

    setTimeout(() => {
      setMounted(false);
    }, 250);
  };

  if (!mounted || !popup?.active || !popup?.imageUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      <div
        className={`
          relative 
          transition-all 
          duration-300
          ${closing ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        `}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={handleClose}
          className="
            absolute 
            top-2 
            right-2 
            z-20 
            rounded-full 
            bg-black/70 
            p-2 
            text-white 
            shadow-lg 
            hover:bg-black 
            transition
          "
          aria-label="Cerrar promoción"
        >
          <X size={18} />
        </button>

        {/* Imagen sin recorte */}
        <img
          src={popup.imageUrl}
          alt="Promoción especial"
          onClick={(e) => e.stopPropagation()}
          className="
            block
            max-w-[95vw]
            max-h-[90vh]
            w-auto
            h-auto
            object-contain
            rounded-3xl
            shadow-2xl
          "
        />
      </div>
    </div>
  );
}